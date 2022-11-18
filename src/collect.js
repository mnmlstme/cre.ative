export function collect(workbook, loadFn, epilog = '') {
  const { modules } = workbook
  const json = JSON.stringify(Object.assign(workbook, { modules: [] }))

  const resourceDefn = (m) => `{
	  language: '${m.language}',
	  filepath: '${m.filepath}',
	  use: '${m.use}',
	  bind: ${m.bind},
	  loader: ${loadFn ? loadFn(m) : 'undefined'}
  }`

  // console.log('Kram modules: ', modules)

  const definitions = modules.map(resourceDefn).join(',\n')

  // console.log('Kram resource definitions: ', definitions)

  return `export default Object.assign(${json},{modules: [${definitions}]});${epilog}`
}
