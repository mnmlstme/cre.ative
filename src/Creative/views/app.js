import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Document } from './document'
import { Render } from './render'
import { changeFile, changeScene, loadWorkbook, loadResource } from '../actions'
import styles from './workbook.css'

const Workbook = ({
  workbook,
  filepath,
  scene,
  resources,
  doChangeScene,
  doLoadResource,
}) => {
  const { title, scenes } = workbook

  return (
    <article className={styles.workbook}>
      <section
        className={styles.layout}
        style={{ top: -100 * (scene - 1) + 'vh' }}
      >
        <Document workbook={workbook} />
        <Render
          workbook={workbook}
          resources={resources}
          doLoadResource={doLoadResource}
        />
      </section>
      <footer>
        <h6>{title || filepath}</h6>
        <select value={scene} onChange={doChangeScene}>
          {scenes.map((scn, i) => (
            <option value={i + 1}>
              {(scn && scn.title) || 'Scene ' + (i + 1)}
            </option>
          ))}
        </select>
      </footer>
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

const Creative = ({ workbook, resources, filepath, scene, dispatch }) => {
  const doLoadWorkbook = (event) => dispatch(loadWorkbook(filepath))
  const doChangeFile = (event) => dispatch(changeFile(event.target.value))
  const doChangeScene = (event) => dispatch(changeScene(event.target.value))
  const doLoadResource = (loader, lang) =>
    dispatch(loadResource(filepath, loader, lang))

  if (workbook) {
    return (
      <Workbook
        {...{
          workbook,
          filepath,
          scene,
          resources,
          doChangeScene,
          doLoadResource,
        }}
      />
    )
  } else {
    return <Finder {...{ filepath, doChangeFile, doLoadWorkbook }} />
  }
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')
  console.log('mapStateToProps', workbook)
  return {
    filepath: workbook.filepath,
    workbook: workbook.isLoaded ? workbook.module : undefined,
    resources: state.get('resources'),
    scene: state.get('current'),
  }
}

export default connect(mapStateToProps)(Creative)
