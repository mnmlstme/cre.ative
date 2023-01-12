const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

export function configure(options) {
  const {
    basedir,
    docroot,
    plugins,
    index,
    projects,
    workbooks,
    app,
    template,
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

  const htmlGenerators = workbooks
    .concat(projects, [index])
    .map(([slugs, file]) => {
      const entry = slugs === "/" ? "index" : path.join(slugs, "index");

      return new HtmlWebpackPlugin({
        inject: false,
        cache: false,
        chunks: [entry, "app"],
        filename: path.join(options.public || "public", slugs, "index.html"),
        template,
        scriptLoading: "blocking",
      });
    });

  const entry = Object.fromEntries(
    [["app", app]].concat(
      workbooks.map(([entry, file]) => [path.join(entry, "index"), file]),
      projects.map(([entry, file]) => [path.join(entry, "index"), file]),
      [["index", index[1]]]
    )
  );

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
      path: path.resolve(__dirname, options.public),
      publicPath: "/",
      library: {
        name: "Kram_module",
        type: "window",
      },
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
          plugins.map(({ name, modules }) => [name, { modules }])
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
