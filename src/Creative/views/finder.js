import React from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { changeFile, loadWorkbook } from '../actions'

const workbooks = [
  // TODO: store these somewhere in db or fs
  { path: 'ElmWorkbook.kr', name: 'Elm Workbook' },
  { path: 'ReactWorkbook.kr', name: 'React Workbook' },
]

function Finder({ filepath, dispatch }) {
  let history = useHistory()

  const doLoadWorkbook = (event) => {
    dispatch(loadWorkbook(filepath))
    history.push(`/workbook/${filepath}`)
  }

  const doChangeFile = (event) => dispatch(changeFile(event.target.value))

  return (
    <section>
      <select value={filepath} onChange={doChangeFile}>
        {workbooks.map(({ path, name }) => (
          <option key={path} value={path}>
            {name}
          </option>
        ))}
      </select>
      <button onClick={doLoadWorkbook}>Open</button>
    </section>
  )
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')

  return {
    filepath: workbook.filepath,
  }
}

export default connect(mapStateToProps)(Finder)
