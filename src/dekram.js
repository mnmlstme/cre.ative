export function dekram(workbook, emitter, plugin) {
  const { languages } = workbook
  const hashedName = workbook.moduleName

  // console.log('Dekram: ', workbook)

  const emit = (module) => {
    const use = module.use(module.language)
    const collated = module.collate(workbook, module.language)
    const files = Array.isArray(collated) ? collated : [collated]

    return files.map((f) => {
      const { moduleName, language, name, mode = 'define', code, ...rest } = f
      const filepath = emitter(name, code, language)
      return {
        moduleName,
        mode,
        language,
        filepath,
        use,
        bind: module.bind(moduleName || name, module.language) || 'null',
        ...rest,
      }
    })
  }

  const modules = plugin.modules
    .filter((m) => languages.find((s) => s === m.language))
    .map(emit)
    .flat()

  // console.log('Dekram modules', modules)

  return { modules, ...workbook }
}
