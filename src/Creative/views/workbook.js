import React from 'react'
import { connect } from 'react-redux'

import { Document } from './document'
import { Render } from './render'
import {
  changeScene,
  loadWorkbook,
  loadResource,
  updateScene,
  saveScene,
} from '../actions'
import styles from './workbook.css'

function Workbook({
  workbook,
  projectId,
  workbookId,
  resources,
  scene,
  urlpath,
  dispatch,
}) {
  if (
    !projectId ||
    !workbookId ||
    [projectId, workbookId].join('/') !== urlpath
  ) {
    let path = urlpath.split('/')
    workbookId = path.pop()
    projectId = path.pop()
    dispatch(loadWorkbook(projectId, workbookId))
  }

  if (!workbook) {
    return <h1>Loading {workbookId} ...</h1>
  }

  const title = workbook.get('title')
  const scenes = workbook.get('scenes')
  const doChangeScene = (event) => dispatch(changeScene(event.target.value))
  const doNextScene = () => dispatch(changeScene(scene + 1))
  const doPrevScene = () => dispatch(changeScene(scene - 1))
  const doUpdateDocument = (blockId, rmNum, ...blocks) =>
    dispatch(updateScene(scene - 1, blockId, rmNum, ...blocks))
  const doSaveDocument = () => dispatch(saveScene(scene - 1))
  const doLoadResource = (module) => dispatch(loadResource(module))

  return (
    <article className={styles.workbook}>
      <section
        className={styles.layout}
        style={{ left: -100 * (scene - 1) + 'vw' }}
      >
        <Document
          workbook={workbook}
          doUpdate={doUpdateDocument}
          doSave={doSaveDocument}
        />
        <Render
          workbook={workbook}
          resources={resources}
          doLoadResource={doLoadResource}
        />
      </section>
      <footer>
        <h6>{title || workbookId}</h6>
        <span>
          <button disabled={scene - 1 < 1} onClick={doPrevScene}>
            &lt;
          </button>
          <select value={scene} onChange={doChangeScene}>
            {scenes.map((scn, i) => (
              <option key={i} value={i + 1}>
                {`Scene ${i + 1}` +
                  [scn && scn.title].map((s) => s && `: ${s}`)}
              </option>
            ))}
          </select>
          <button disabled={scene + 1 > scenes.length} onClick={doNextScene}>
            &gt;
          </button>
        </span>
        <h6></h6>
      </footer>
    </article>
  )
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')

  return {
    projectId: workbook.get('projectId'),
    workbookId: workbook.get('workbookId'),
    workbook: workbook.get('isLoaded') ? workbook : undefined,
    resources: state.get('resources'),
    scene: state.get('current'),
  }
}

export default connect(mapStateToProps)(Workbook)
