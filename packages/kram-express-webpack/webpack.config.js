var path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

const library = {
  name: "library",

  entry: {
    index: "./src/index.js",
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
  },
};

const backend = {
  name: "backend",

  entry: {
    server: "./src/main.js",
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist"),
    libraryTarget: "commonjs",
  },
};

const common = {
  target: "node",
  mode: "development",
  externals: [nodeExternals()],
};

module.exports = [
  Object.assign({}, common, library),
  Object.assign({}, common, backend),
];
