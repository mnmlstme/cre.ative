export function collect(workbook, loadFn) {
  const { modules } = workbook
  const json = JSON.stringify(Object.assign(workbook, { modules: 'TBD' }))

  const defaultLoadFn = (path, using) => {
    const target = using ? `!${using}!${path}` : path

    return `function () { return import('${target}') }`
  }

  const resourceDefn = (m) => `{
	language: '${m.language}',
	filepath: '${m.filepath}',
	use: '${m.use}',
	bind: ${m.bind},
	loader: ${(loadFn || defaultLoadFn)(m.filepath, m.use)}
  }`

  // console.log('Kram modules: ', modules)

  const definitions = modules.map(resourceDefn).join(',\n')

  // console.log('Kram resource definitions: ', definitions)

  return `export default Object.assign(${json},{modules: [${definitions}]})`
}
