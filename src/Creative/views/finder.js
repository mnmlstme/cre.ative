import React from 'react'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import {
  changeFile,
  changeProject,
  loadIndex,
  loadWorkbook,
  loadProject,
} from '../actions'

function Finder({ projects, project, workbooks, selected, dispatch }) {
  if (!projects || projects.length == 0) {
    dispatch(loadIndex())
    return <h1>Loading Project Index ...</h1>
  }

  if (!project) {
    const doChangeProject = (event) =>
      dispatch(changeProject(event.target.value))

    return (
      <section>
        <ul>
          {projects.map((p) => (
            <li key={p.name}>
              <button onClick={doChangeProject} value={p.name}>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  if (!workbooks) {
    dispatch(loadProject(project))
    return <h1>Loading Project {project} ...</h1>
  }

  let navigate = useNavigate()

  const doLoadWorkbook = (event) => {
    navigate(`../workbook/${project}/${selected.replace(/\.\w+$/, '')}`)
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
  const { projects, project, workbooks, selected } = state
    .get('finder')
    .toObject()

  return { projects, project, workbooks, selected }
}

export default connect(mapStateToProps)(Finder)
