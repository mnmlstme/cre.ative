import React from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { changeFile, loadWorkbook, loadProject } from '../actions'

function Finder({ project, workbooks, selected, dispatch }) {
  if (!workbooks) {
    dispatch(loadProject(project))
    return <h1>Loading Project {project} ...</h1>
  }

  let history = useHistory()

  const doLoadWorkbook = (event) => {
    history.push(`/workbook/${project}/${selected.replace(/\.\w+$/, '')}`)
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
