import React from 'react'
import ReactDOM from 'react-dom'
const Redux = require('redux')
import { Provider, connect } from 'react-redux'
import Im from 'immutable'
import Creative from './Creative/app.js'
import workbook from './ReactWorkbook.kr'

const mountpoint = document.getElementById('lets-be-cre-at-ive')
const initial = {
  workbook: Im.Map({
    filepath: 'ElmWorkbook.kr',
    isLoaded: false,
  }),
}
const init = Im.Map(initial)
const model = Redux.createStore(update)
const App = connect(mapStateToProps, mapDispatchToProps)(Creative)

function Main({ model }) {
  return (
    <Provider store={model}>
      <App />
    </Provider>
  )
}

ReactDOM.render(React.createElement(Main, { model }), mountpoint)

function mapStateToProps(state) {
  const workbook = state.get('workbook')
  return {
    filepath: workbook.get('filepath'),
    workbook: workbook.get('isLoaded') ? workbook.get('data') : false,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    changeFile: (filepath) => dispatch({ type: 'ChangeFile', filepath }),
    loadFile: () => dispatch({ type: 'LoadFile' }),
  }
}

function update(state = init, action = {}) {
  let workbook = state.get('workbook')

  switch (action.type) {
    case 'LoadFile':
      console.log('LoadFile', workbook.get('filepath'))
      return state.set(
        'workbook',
        workbook
          .set('data', load_workbook(workbook.get('filepath')))
          .set('isLoaded', true)
      )
    case 'ChangeFile':
      return state.set(
        'workbook',
        In.Map({ filepath: action.filepath, isLoaded: false })
      )
    default:
      return state
  }
}

function load_workbook(filename) {
  return import(`./${filename}`)
}
