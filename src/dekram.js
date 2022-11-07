export function dekram(workbook, emitter, plugin) {
  const { languages } = workbook
  const hashedName = workbook.moduleName

  // console.log('Dekram: ', workbook)

  const emit = (module) => {
    const collated = module.collate(workbook, module.language)
    const { moduleName, language, name, code } = collated
    const filepath = emitter(name, code)
    const use = module.use(module.language)
    return {
      language,
      filepath,
      use,
      bind: module.bind(moduleName || hashedName, module.language) || 'null',
    }
  }

  const modules = plugin.modules
    .filter((m) => languages.find((s) => s === m.language))
    .map(emit)

  // console.log('Dekram modules', modules)

  return { modules, ...workbook }
}
