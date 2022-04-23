const path = require('path')

export function configure(options) {
  const { basedir, approot, docroot, entry } = options

  return {
    name: 'dev-server',
    entry: {
      client: entry || path.resolve(approot, './client.js'),
    },
    mode: 'development',
    module: {
      rules: kramRules(options),
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: 'chunk.[id].js',
      publicPath: '/',
    },
    resolve: {
      alias: {
        DOCROOT: docroot || path.resolve(basedir, './projects'),
      },
      modules: ['node_modules'],
      extensions: ['.js'],
      mainFields: ['browser', 'main'],
    },
    resolveLoader: {
      modules: ['node_modules'],
      extensions: ['.js'],
      mainFields: ['loader', 'main'],
    },
  }
}

function kramRules({ basedir, docroot, platforms }) {
  const buildDir = path.resolve(basedir, 'kram_modules')

  const projectYaml = {
    test: /\.yaml$/,
    include: [docroot],
    type: 'json', // Required by Webpack v4
    use: 'yaml-loader',
  }

  const workbookMd = {
    test: /\.kr$/,
    include: [docroot],
    use: {
      loader: 'kram',
      options: {
        root: docroot,
        output: buildDir,
        defaults: {
          platform: 'elm',
          language: 'elm',
        },
        platforms
      },
    },
  }

  return [projectYaml, workbookMd]
}


