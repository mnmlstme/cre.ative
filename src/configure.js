const path = require("path");
const webpack = require("webpack");

export function configure(options) {
  const { basedir, approot, docroot, platforms, entry } = options;
  const moduledir = path.resolve(basedir, "./node_modules");
  const kramdir = path.resolve(basedir, "./kram_modules");
  const projdir = path.resolve(basedir, "./projects");

  return {
    name: "dev-server",
    context: basedir,
    entry: {
      client: [
        entry || path.resolve(approot, "./client.js"),
        "webpack-hot-middleware/client.js?path=/__webpack_hmr&timeout=20000",
      ],
    },
    mode: "development",
    module: {
      rules: kramRules({ docroot, platforms, kramdir }),
    },
    output: {
      filename: "[name].bundle.js",
      chunkFilename: "chunk.[id].js",
      publicPath: "/",
    },
    resolve: {
      alias: {
        PROJECTS: projdir,
        DEKRAM: kramdir,
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
    devServer: {
      overlay: true,
      hot: true,
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  };
}

function kramRules({ docroot, platforms, kramdir }) {
  const projectYaml = {
    test: /\.yaml$/,
    include: [docroot],
    // type: "json", // Required by Webpack v4
    use: "yaml-loader",
  };

  const workbookMd = {
    test: /\.md$/,
    include: [docroot],
    use: {
      loader: "@cre.ative/kram-express-webpack",
      options: {
        platforms,
        output: kramdir,
      },
    },
  };

  return [projectYaml, workbookMd];
}
