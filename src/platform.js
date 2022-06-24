const { defaultClassifier } = require('./classify')
const { extract } = require('./extract')

const defaultModule = {
  bind: (moduleName, lang) => {
    switch (lang) {
      case 'css':
        return `function(resource, container) {
						let sheet = document.createElement('style')
						sheet.innerHTML = resource.default
						container.appendChild(sheet);
					}`
      default:
        return `function(resource, container, initial) {
						resource.mount(container, initial)
					}`
    }
  },

  classify: defaultClassifier,

  collate: (workbook, lang) => {
    const defns = extract(workbook, 'define', lang)

    return {
      name: `code.${lang}`,
      language: lang,
      code: defns.map((b) => b[2]).join('\n'),
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
  description: 'Standard technologies supported by all browsers',
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
  const { name, description, languages, register, ...rest } = platform
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
