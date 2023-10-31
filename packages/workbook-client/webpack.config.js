var path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const docroot = path.resolve(__dirname, 'workbooks')

const frontend = {
  name: 'frontend',
  target: 'web',

  entry: {
    client: './src/Creative/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'Cre_ative',
      type: 'window',
    },
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: [
              [
                'prismjs',
                {
                  // we support code highlighting for these languages:
                  languages: [
                    'javascript',
                    'css',
                    'markup',
                    'html',
                    'jsx',
                    'tsx',
                    'elm',
                  ],
                  plugins: ['line-numbers'],
                  theme: 'funky',
                  css: false,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/prismjs/themes'),
        ],
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: 'svg-sprite-loader',
          options: {
            idPrefix: true,
            classPrefix: true,
            removingTagAttrs: ['xmlns', 'xmlns:xlink', 'version'],
          },
        },
      },
    ],
  },
}

const backend = {
  name: 'backend',
  target: 'node',

  entry: {
    server: './src/server/main.js',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
  },

  externals: [nodeExternals()],

  plugins: [
    new webpack.BannerPlugin({
      raw: true,
      banner: '#!/usr/bin/env node\n',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/templates',
          to: 'templates',
        },
      ],
    }),
  ],
}

const common = {
  mode: 'development',
}

module.exports = [
  Object.assign({}, common, frontend),
  Object.assign({}, common, backend),
]
