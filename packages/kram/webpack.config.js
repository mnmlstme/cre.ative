var path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'development',
  target: 'node',

  entry: {
    index: './src/index.js',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'commonjs',
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js'],
  },

  externals: [nodeExternals()],
}
