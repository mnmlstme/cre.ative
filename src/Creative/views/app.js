import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Document } from './document'
import { Render } from './render'
import { changeFile, loadWorkbook, loadResource } from '../actions'
import styles from './workbook.css'

const Workbook = ({ workbook, resources, doLoadResource }) => {
  const { title } = workbook

  return (
    <article className={styles.workbook}>
      <header>{title}</header>
      <section className={styles.layout}>
        <Document workbook={workbook} />
        <Render
          workbook={workbook}
          resources={resources}
          doLoadResource={doLoadResource}
        />
      </section>
    </article>
  )
}

const Finder = ({ filepath, doChangeFile, doLoadWorkbook }) => {
  const workbooks = [
    // TODO: store these somewhere in db or fs
    { path: 'ElmWorkbook.kr', name: 'Elm Workbook' },
    { path: 'ReactWorkbook.kr', name: 'React Workbook' },
  ]

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

const Creative = ({ workbook, resources, filepath, dispatch }) => {
  const doLoadWorkbook = (event) => dispatch(loadWorkbook(filepath))
  const doChangeFile = (event) => dispatch(changeFile(event.target.value))
  const doLoadResource = (loader, lang) =>
    dispatch(loadResource(filepath, loader, lang))

  if (workbook) {
    return (
      <Workbook
        workbook={workbook}
        resources={resources}
        doLoadResource={doLoadResource}
      />
    )
  } else {
    return (
      <Finder
        filepath={filepath}
        doChangeFile={doChangeFile}
        doLoadWorkbook={doLoadWorkbook}
      />
    )
  }
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')
  console.log('mapStateToProps', workbook)
  return {
    filepath: workbook.filepath,
    workbook: workbook.isLoaded ? workbook.module : undefined,
    resources: state.get('resources'),
  }
}

export default connect(mapStateToProps)(Creative)
