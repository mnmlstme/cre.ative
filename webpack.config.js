var path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')


module.exports = {
  name: 'backend',
  mode: 'development',
  target: 'node',

  entry: {
    server: './src/express/main.js',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
  },

  externals: [nodeExternals()],

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js'],
  }
}
