const { getOptions } = require('loader-utils')

const path = require('path')
const Kr = require('../index.js')

function loader(content) {
    const basename = path.basename(this.resourcePath, ".kr")
    const options = getOptions(this) || {}
    const defaults = options.defaults || {}
    const callback = this.async()
    const q = this.resourceQuery

    console.log("Kram loader options: ", options)
    console.log("Kram loader query: ", q)

    if ( q ) {
      // dekram workbook for a specific platform & language

      console.log("Dekram: ", q, content)

      const matches = q.match(/^\?dekram=(([^:]+):)?(\w+)$/)
      // const matches = dekram.match(/^(([^:]+):)?(\w+)$/)
      const platform = matches && matches[2] || defaults.platform || 'html'
      const language = matches && matches[3] || defaults.language || 'html'
      const config = getPlatformByName(options.platforms, platform)

      const plugin = loadPlugin(config, this.rootContext)

      parse(content, basename)
        .then(wb => dekram(wb, language, this.emitFile, plugin))
        .then(component => callback(null, component))
        .catch(callback)

    } else {
      // initial parse of markdown and frontMatter

      parse(content, basename)
        .then(wb => collect(wb, options, this.resourcePath, this.rootContext))
        .then(component => callback(null, component))
        .catch(callback)

    }

}

function parse(content, basename) {
  return new Promise((resolve, reject) => {
    try {
      const workbook = Kr.parse(content, basename)

      resolve(workbook)
    } catch (err) {
      reject(err)
    }
  })
}

const defaultPlugin = {
  collate: function (workbook, lang) {
    const chunks = Kr.extract(workbook, lang)
    return chunks.map(t => t.text).join('\n')
  }
}

function loadPlugin(config, rootContext) {
  // TODO: use module resolution for plugins
  const pluginPath = path.resolve(rootContext, config.plugin)
  return require(pluginPath)
}

function dekram(workbook, lang, emitter, plugin=defaultPlugin) {
  const { moduleName } = workbook
  const { collate } = plugin
  const filename = [moduleName, lang].join('.')
  const code = collate(workbook, lang)

  return emitter(filename, code)

}

function collect(workbook, options, resourcePath, rootContext) {
  const json = JSON.stringify( workbook )
  const {platforms, root} = options
  const {basename, moduleName, platform, languages} = workbook
  const config = getPlatformByName(platforms, platform)
  const plugin = loadPlugin(config, rootContext)

  const modules = config.modules
    .filter( m => languages.find(s => s === m.language) )
    .map( m => ({
      language: m.language,
      pipeline: m.use,
      query: `dekram=${platform}:${m.language}`
    }))

  const loader = m =>
    `() => import(\`${m.pipeline}!${resourcePath}?${m.query}\`)`

  const binder = m => plugin.bind(moduleName, m.language)

  const resourceDefn = m =>
    `{language: "${m.language}", load: ${loader(m)}, bind: ${binder(m)} }`

  const definitions = modules.map(resourceDefn).join(",\n")

  return `export default Object.assign(
    {modules: [${definitions}]},
    ${json})`
}

function getPlatformByName(list, name) {
  const matching = list.filter( p => p.name === name )

  if (matching.length === 1) {
    return matching[0]
  } else {
    throw `no platform found for ${name}`
  }
}

module.exports = loader
