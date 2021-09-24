const Kr = require('kram')

module.exports = {
  collate,
  bind,
}

function bind(moduleName, lang = 'jsx') {
  return `function(module, node, initial) {
    module.mount(node, initial)
  }`
}

function collate(workbook, lang) {
  // generates JSX module

  const { imports, moduleName, shape } = workbook
  const scenes = Kr.extract(workbook, lang)

  const code = `// module ${moduleName} (JSX)
import React from 'react'
import ReactDOM from 'react-dom'
const Redux = require('redux')
import Im from 'immutable'
import { Provider, connect } from 'react-redux'
${imports.map(genImport).join('\n')}

const View = (${genProps(shape)}) =>
  (<ol>
      ${scenes.map(genView).join('\n')}
  </ol>)

const mapStateToProps = state =>
  ( ${genExposeModel(shape)} )

const Component = connect(mapStateToProps)(View)

const Program = ({ model }) =>
  (<Provider store={model}>
    <Component />
  </Provider>)

function mount (mountpoint, initial) {

  const init = Im.Map(initial)
  const model = Redux.createStore(update)

  ReactDOM.render(
    React.createElement(Program, { model } ),
    mountpoint
  )

  function update (state = init, action = {}) {
      let value = state.get('value')
      switch (action.type) {
          case 'Increment':
              console.log('increment', state)
              return state.set('value', value + 1)
          case 'Decrement':
              console.log('decrement', state)
              return state.set('value', value - 1)
          default:
              return state
      }
  }
}

export {
    Program,
    mount
}
`

  return {
    name: `index.${lang}`,
    language: lang,
    code,
  }
}

function genImport(spec) {
  return `import ${spec.as} from '${spec.from}'`
}

function genProps(shape) {
  const record = Kr.recordType(shape)
  if (record) return `{ ${Object.keys(record).join(', ')} }`

  return ''
}

function genExposeModel(shape) {
  const record = Kr.recordType(shape)
  const expose = (k) => `${k}: state.get('${k}')`

  if (record)
    return `{
      ${Object.keys(record).map(expose).join(', ')}
    }`

  return '{}'
}

function genView(list) {
  return list
    .map(
      (chunk) =>
        `<li key="${chunk.id}" id="${chunk.id}">
       ${chunk.text.split('\n').join('\n        ')}
     </li>
    `
    )
    .join('\n')
}
