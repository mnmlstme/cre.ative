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
  const basename = path.basename(relpath, '.kr')
  const dir = path.join(path.dirname(relpath), basename)
  const outdir = output ? path.join(output, dir) : dir

  const callback = this.async()

  // console.log("Kram resource: ", this.resourcePath)

  const emit = (name, code) => {
    const filename = path.join(outdir, name)
    fs.mkdirSync(outdir, { recursive: true })
    fs.writeFileSync(filename, code)
    return filename
  }

  const requirePlugin = (request) => {
    return new Promise((resolve, reject) => {
      this.resolve(this.rootContext, request, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve( require(result) )
        }
      })
    })
  }
  
  // initial parse of markdown and frontMatter

  parse(content, basename)
    .then((wb) => providePlugin(wb, requirePlugin, options.platforms))
    .then(([ wb, plugin ]) => classify(wb, plugin))
    .then(([ wb, plugin ]) => dekram(wb, emit, plugin))
    .then(([ wb, plugin ]) => collect(wb, plugin))
    .then((component) => callback(null, component))
    .catch(callback)
}

function getPlatformByName(name, list) {
  const matching = list.filter((p) => p.name === name)

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

function providePlugin(wb, requirePlugin, platforms = {}) {
  const name = wb.platform
  const platform = platforms[name] || name
  
  // console.log('Loading plugin:', name, platforms[name])
  
  if ( platform ) {
    return requirePlugin(platforms[name] || name)
        .then( plugin => ([wb, Kr.register(plugin, name)]) )
  } else {
    return [wb, Kr.defaultPlugin]
  }
}

function classify(wb, plugin) {
  console.log('Classifying with plugin:', plugin)
  
  return [ Kr.classify(wb, plugin.modules), plugin ]
}

function dekram(workbook, emitter, plugin = Kr.defaultPlugin) {
  const { moduleName, languages } = workbook

  // console.log('Dekram: ', workbook, plugin)
  
  const emit = (module) => {
    // console.log('Emit module:', module )
    const { language, name, code } = module.collate(workbook, module.language)
    return {
      language,
      filepath: emitter(name, code),
    }
  }

  const modules = plugin.modules
    .filter((m) => languages.find((s) => s === m.language))
    .map((m) =>
      Object.assign(emit(m), {
        pipeline: m.use(m.language),
        bind: m.bind(moduleName, m.language) || 'null',
      })
    )

  return [ {modules, ...workbook}, plugin ]
}

function collect(workbook, config) {
  const { modules } = workbook
  const json = JSON.stringify(Object.assign(workbook, { modules: 'TBD' }))

  const loader = (m) =>
    `function () { return import(\`!${m.pipeline}!${m.filepath}\`) }`

  const resourceDefn = (m) =>
    `{language: "${m.language}", load: ${loader(m)}, bind: ${m.bind}}`

  const definitions = modules.map(resourceDefn).join(',\n')

  // console.log("Kram module definitions: ", definitions)

  return `export default Object.assign(${json},{modules: [${definitions}]})`
}

module.exports = loader
