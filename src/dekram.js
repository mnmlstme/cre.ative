export function dekram(workbook, emitter, plugin) {
  const { moduleName, languages } = workbook

  // console.log('Dekram: ', workbook)

  const emit = (module) => {
    // console.log('Emit module:', module )
    const { language, name, code } = module.collate(workbook, module.language)
    const filepath = emitter(name, code)
    const use = module.use(module.language)
    return {
      language,
      filepath,
      use,
      bind: module.bind(moduleName, module.language) || 'null',
    }
  }

  const modules = plugin.modules
    .filter((m) => languages.find((s) => s === m.language))
    .map(emit)

  // console.log('Dekram modules', modules)

  return { modules, ...workbook }
}
