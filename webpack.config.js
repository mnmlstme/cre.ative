var path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const frontend = {
  name: 'frontend',

  entry: {
    app: './src/index.js',
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Enable HMR
  ],

  devServer: {
    port: 9000,
    historyApiFallback: true,
    hot: true, // Tell the dev-server we're using HMR
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: 'babel-loader',
          query: {
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
        test: /.elm$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['module:elm-css-modules-plugin'],
              //   presets: ["@babel/preset-env"],
              // plugins: [elmCssModulesPlugin]
            },
          },
          { loader: 'elm-webpack-loader' },
        ],
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
          loader: 'svg-inline-loader',
          query: {
            idPrefix: true,
            classPrefix: true,
            removingTagAttrs: ['xmlns', 'xmlns:xlink', 'version'],
          },
        },
      },
      {
        test: /project\.yaml$/,
        include: [path.resolve(__dirname, 'workbooks')],
        type: 'json', // Required by Webpack v4
        use: 'yaml-loader',
      },
      {
        test: /\.kr$/,
        include: [path.resolve(__dirname, 'workbooks')],
        use: {
          loader: 'kram',
          options: {
            root: path.resolve(__dirname, 'workbooks'),
            output: path.resolve(__dirname, 'kram_modules'),
            defaults: {
              platform: 'elm',
              language: 'elm',
            },
            platforms: [
              {
                name: 'react-redux',
                description: 'React (JSX) for Views and Redux for data model',
                modules: [
                  {
                    language: 'jsx',
                    use: 'babel-loader?{presets:["@babel/preset-react"]}',
                  },
                  {
                    language: 'svg',
                    use: 'svg-inline-loader',
                  },
                  {
                    language: 'css',
                    use: 'css-loader',
                  },
                ],
                plugin: require('kram-react-redux'),
              },
              {
                name: 'elm',
                description:
                  'The Elm Architecture: a pure functional language with ADTs and an MVU architecture',
                modules: [
                  {
                    language: 'elm',
                    use: 'elm-webpack-loader',
                  },
                  {
                    language: 'css',
                    use: 'css-loader',
                  },
                ],
                plugin: require('kram-elm'),
              },
            ],
          },
        },
      },
    ],
  },
}

const backend = {
  name: 'backend',

  entry: {
    server: './src/server/main.js',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
  },
  target: 'node',
  externals: [nodeExternals()],
}

const common = {
  mode: 'development',

  resolve: {
    alias: {
      Workbooks: path.resolve(__dirname, 'workbooks'),
    },
    modules: ['node_modules'],
    extensions: ['.js'],
  },

  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js'],
    mainFields: ['loader', 'main'],
  },

  output: {
    filename: '[name].bundle.js',
    chunkFilename: 'chunk.[id].js',
    publicPath: '/',
  },
}

module.exports = [
  Object.assign({}, common, frontend),
  Object.assign({}, common, backend),
]
