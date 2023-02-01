const { defaultClassifier } = require('./classify')
const { extract } = require('./extract')

const defaultModule = {
  bind: (moduleName, lang) => {
    switch (lang) {
      // load all definitions, and return an eval function
      case 'css':
        return `function(resource, container) {
						let sheet = document.createElement('style')
						sheet.innerHTML = resource.default
						container.appendChild(sheet);
            return function (scene, container) {}
					}`

      case 'html':
        return `function(resource /*, container*/ ) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(resource.default, 'text/html')
          const body = doc.body.firstChild
          const children = body.children
          const scenes = Object.fromEntries(
            Array.prototype.map.call(children, 
              (node) => {
                const idmatch = node && node.id && node.id.match(/kramScene-(\\d+)/)
                return idmatch ? [idmatch[1], node] : null
              })
              .filter(Boolean)
          )
          return function (n, container) {
            container.appendChild(scenes[n])
          }
        }`

      case 'svg':
        return `function(resource /*, container*/ ) {
            const parser = new DOMParser()
            const doc = parser.parseFromString(resource.default, 'image/svg+xml')
            const body = doc.firstChild
            const children = Array.prototype.slice.call(body.children, 1)
            const scenes = Object.fromEntries(
              Array.prototype.map.call(children, 
                (node) => {
                  const idmatch = node && node.id && node.id.match(/kramScene-(\\d+)/)
                  return idmatch ? [idmatch[1], node] : null
                })
                .filter(Boolean)
            )
            return function (n, container) {
              container.appendChild(scenes[n])
            }
					}`

      default:
        return `function(resource, container, initial) {
						return resource.mount(container, initial)
					}`
    }
  },

  classify: defaultClassifier,

  collate: (workbook, lang) => {
    // collates definitions and evaluations and generates code
    // emit definitions first, followed by a list or group of all the evaluations
    const defns = extract(workbook, 'define', lang).map((b) => b[2])
    const evals = extract(workbook, 'eval', lang).map((b) => [
      b[1]['scene'],
      b[2],
    ])
    let evalcontainer = evals
    let defscontainer = defns
    let open = []
    let close = []

    switch (lang) {
      case 'html':
        open = ['<html>']
        close = ['</html>']
        evalcontainer = ['<ol>'].concat(
          evals.map(([n, el]) => `<li id="kramScene-${n + 1}">${el}</li>`),
          ['</ol>']
        )
        break
      case 'svg':
        open = ['<svg xmlns="http://www.w3.org/2000/svg">']
        close = ['</svg>']
        evalcontainer = evals.map(
          ([n, el]) =>
            `<svg id="kramScene-${n + 1}" viewBox="0 0 100 100">${el}</svg>`
        )
        defscontainer = ['<defs>'].concat(defns, ['</defs>'])
        break
    }

    return {
      name: `code.${lang}`,
      language: lang,
      code: open.concat(defscontainer, evalcontainer, close).join('\n'),
    }
  },

  use: () => 'raw-loader',
}

const defaultLanguages = {
  html: 'Hypertext Markup Language (HTML5)',
  css: 'Cascading Style Sheets (CSS3)',
  js: 'Javascript (ES6)',
  svg: 'Scalable Vector Graphics',
}

const defaultPlugin = {
  name: 'web-standard',
  displayName: 'Web (W3C Standard)',
  description: 'Standard technologies supported by nearly all browsers',
  languages: defaultLanguages,
  modules: Object.keys(defaultLanguages).map((language) => ({
    language,
    ...defaultModule,
  })),
}

module.exports = {
  register,
  defaultPlugin,
}

function register(platform, assignedName) {
  const { name, displayName, description, languages, register, ...rest } =
    platform
  let plugins = {}

  if (register) {
    let providers = {}

    register({
      providesLanguage: (lang, dict) => (providers[lang] = dict),
    })

    plugins = create(providers)
  }

  const plugin = {
    name: assignedName || name,
    displayName,
    description,
    languages,
    ...rest,
    ...plugins,
  }

  console.log('Plugin registered:', assignedName || name, plugin)

  return plugin
}

function create(providers) {
  return {
    modules: Object.keys(providers).map((language) => ({
      language,
      ...defaultModule,
      ...(providers[language] || {}),
    })),
  }
}
