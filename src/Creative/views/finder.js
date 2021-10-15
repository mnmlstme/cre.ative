import React from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { changeFile, loadWorkbook } from '../actions'

function Finder({ project, workbooks, selected, dispatch }) {
  let history = useHistory()

  const doLoadWorkbook = (event) => {
    dispatch(loadWorkbook(selected))
    history.push(`/workbook/${selected}`)
  }

  const doChangeFile = (event) => dispatch(changeFile(event.target.value))

  return (
    <section>
      <ul>
        {workbooks.map(({ file, title }) => (
          <li key={file}>
            <label>
              <input
                type="radio"
                name="workbook"
                value={file}
                onChange={doChangeFile}
              />{' '}
              {title}
            </label>
          </li>
        ))}
      </ul>
      <button disabled={!selected} onClick={doLoadWorkbook}>
        Open
      </button>{' '}
      File: {selected}
    </section>
  )
}

function mapStateToProps(state) {
  console.log('Finder state:', state.get('finder').toObject())
  const { project, workbooks, selected } = state.get('finder').toObject()

  return { project, workbooks, selected }
}

export default connect(mapStateToProps)(Finder)
