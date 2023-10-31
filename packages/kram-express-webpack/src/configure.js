const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

export function configure(options) {
  const {
    basedir,
    docroot,
    plugins,
    entry,
    library,
    generated,
    template,
    inPlace,
  } = options;
  const kramdir = path.resolve(basedir, "./kram_modules");
  const projdir = path.resolve(basedir, "./projects");

  const devServer = options.dev
    ? {
        devServer: {
          overlay: true,
          hot: options.dev === "hot",
        },
      }
    : {};

  const htmlGenerators = generated
    ? generated.map(([entry, template, ...dependencies]) => {
        const relPath = path.relative(projdir, path.dirname(entry));

        return new HtmlWebpackPlugin({
          inject: false,
          cache: false,
          chunks: [entry].concat(dependencies),
          filename: path.join(
            options.public || "public",
            relPath,
            path.basename(entry, ".md"),
            "index.html"
          ),
          template,
          scriptLoading: "blocking",
        });
      })
    : [];

  return {
    name: "kram-webpack",
    context: basedir,
    entry,
    mode: options.dev ? "development" : "production",
    module: {
      rules: kramRules({ docroot, plugins, kramdir }),
    },
    output: {
      chunkFilename: "kram.[id].js",
      chunkFormat: "module",
      path: path.resolve(__dirname, options.public),
      library,
    },
    resolve: {
      alias: {
        PROJECTS: projdir,
        DEKRAM: kramdir,
        PUBLIC: path.resolve(__dirname, options.public),
      },
      modules: ["node_modules"],
      extensions: [".js"],
      mainFields: ["browser", "main"],
    },
    resolveLoader: {
      modules: ["node_modules"],
      extensions: [".js"],
      mainFields: ["loader", "main"],
    },
    ...devServer,
    plugins: (options.dev === "hot"
      ? [new webpack.HotModuleReplacementPlugin()]
      : []
    ).concat(htmlGenerators),
    experiments: { outputModule: true },
  };
}

function kramRules({ docroot, plugins, kramdir }) {
  const projectYaml = {
    test: /\.yaml$/,
    include: [docroot],
    use: "yaml-loader",
  };

  const workbookMd = {
    test: /\.md$/,
    include: [docroot],
    use: {
      loader: "@cre.ative/kram-express-webpack",
      options: {
        platforms: Object.fromEntries(
          plugins.map(({ name, ...rest }) => [name, rest])
        ),
        output: kramdir,
      },
    },
  };

  const pluginRules = plugins.map((plugin) => {
    const platform = plugin.name;
    return plugin.modules.map(({ language, use }) => {
      return {
        test: RegExp(`\.${language}\$`),
        include: [`${kramdir}/${platform}`],
        use: use(),
      };
    });
  });

  return [projectYaml, workbookMd].concat(...pluginRules);
}
