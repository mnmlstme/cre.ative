var path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    app: './src/index.js',
  },

  mode: 'development',

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [path.resolve(__dirname, './node_modules')],
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/preset-react'],
            // plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      {
        test: /.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
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
        exclude: /node_modules/,
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
        exclude: /node_modules/,
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
                plugin: './platforms/react-redux',
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
                ],
                plugin: './platforms/elm',
              },
            ],
          },
        },
      },
    ],
  },

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

  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Enable HMR
  ],

  output: {
    filename: '[name].bundle.js',
    chunkFilename: 'chunk.[id].js',
    publicPath: '/',
  },

  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true, // Tell the dev-server we're using HMR
  },
}
