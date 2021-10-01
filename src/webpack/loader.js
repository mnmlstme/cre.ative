const { getOptions } = require('loader-utils')
const fs = require('fs')
const path = require('path')
const Kr = require('../index.js')

function loader(content) {
    const options = getOptions(this) || {}
    const defaults = options.defaults || {}
    const root = options.root || this.rootContext
    const output = options.output

    const relpath = path.relative(root, this.resourcePath)
    const basename = path.basename(relpath, ".kr")
    const dir = path.join(path.dirname(relpath), basename)
    const outdir = output ? path.join(output, dir) : dir

    const callback = this.async()

    console.log("Kram resource: ", this.resourcePath)

    const getConfig = platform =>
      getPlatformByName(platform, options.platforms)

    const defaultPlugin = {
      collate: function (workbook, lang) {
        const chunks = Kr.extract(workbook, lang)
        return chunks.map(t => t.text).join('\n')
      }
    }

    const getPlugin = platform => {
      const config = getConfig(platform)

      if (config.plugin) {
        const pluginPath = path.resolve(this.rootContext, config.plugin)
        return require(pluginPath)
      } else {
        return defaultPlugin
      }
    }

    const emit = (name, code) => {
      const filename = path.join(outdir, name)
      fs.mkdirSync(outdir, {recursive: true})
      fs.writeFileSync(filename, code)
      return filename
    }

    // initial parse of markdown and frontMatter

    parse(content, basename)
      .then(wb => dekram(wb, getConfig(wb.platform), emit, getPlugin(wb.platform)))
      .then(wb => collect(wb, getConfig(wb.platform)))
      .then(component => callback(null, component))
      .catch(callback)
}

function getPlatformByName(name, list) {
  const matching = list.filter( p => p.name === name )

  if (matching.length === 1) {
    return matching[0]
  } else {
    return {}
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

function dekram(workbook, config, emitter, plugin=defaultPlugin) {
  const { moduleName, languages } = workbook
  const { collate } = plugin

  const emit = lang => {
    const {name, language, code} = collate(workbook, lang)
    return {
      language,
      filepath: emitter(name, code),
    }
  }

  const modules = config.modules
    .filter( m => languages.find(s => s === m.language) )
    .map( m => Object.assign(
      emit(m.language),
      {
        pipeline: m.use,
        bind: plugin.bind(moduleName, m.language)
      }
    ))

  return Object.assign({modules}, workbook)
}

function collect(workbook, config) {
  const {modules} = workbook
  const json = JSON.stringify(Object.assign(workbook, {modules: "TBD"}))

  const loader = m =>
    `function () { return import(\`!${m.pipeline}!${m.filepath}\`) }`

  const resourceDefn = m =>
    `{language: "${m.language}", load: ${loader(m)}, bind: ${m.bind} }`

  const definitions = modules.map(resourceDefn).join(",\n")

  console.log("Kram module definitions: ", definitions)

  return `export default Object.assign(${json},{modules: [${definitions}]})`
}

module.exports = loader
