const { extract } = require('./extract')

module.exports = {
  register,
}

const defaultModule = {
  // assume module is ES6, no loaders required
  use: () => undefined,

  // with no other information, assume it's a definition
  classify: () => 'define',

  collate: (workbook, lang) => {
    // collates definitions and scenes and generates a code resource
    // emit definitions first, followed by a list or group of all the evaluations
    const { scenes, definitions } = extract(workbook, lang)

    return {
      name: `code.${lang}`,
      language: lang,
      code: definitions
        .concat(scenes)
        .map(([n, attrs, code]) => code)
        .join('\n'),
      bind: '(r, c) => { r.mount(c) }',
    }
  },
}

function register(platform, assignedName) {
  const { name, displayName, description, languages, register, ...rest } =
    platform
  let modules = []

  if (register) {
    register({
      defaultModule,
      providesLanguage: (language, dict = {}) => {
        modules.push({
          language,
          ...defaultModule,
          ...dict,
        })
      },
    })
  }

  const plugin = {
    name: assignedName || name,
    displayName,
    description,
    languages,
    modules,
    ...rest,
  }

  // console.log('Plugin registered:', assignedName || name, plugin)

  return plugin
}
