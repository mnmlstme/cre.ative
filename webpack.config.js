var path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  target: "node",

  entry: {
    index: "./index.js",
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist"),
    libraryTarget: "commonjs",
  },

  resolve: {
    modules: ["node_modules"],
    extensions: [".js"],
  },
};
