import React from 'react'
import { connect } from 'react-redux'

import { Document } from './document'
import { Render } from './render'
import { changeScene, loadResource, loadWorkbook } from '../actions'
import styles from './workbook.css'

function Workbook({ workbook, filepath, resources, scene, urlpath, dispatch }) {
  if (!workbook) {
    if (!filepath) {
      filepath = urlpath + '.kr'
      dispatch(loadWorkbook(filepath))
    }
    return <h1>Loading {filepath} ...</h1>
  }

  const { title, scenes } = workbook
  const doChangeScene = (event) => dispatch(changeScene(event.target.value))
  const doNextScene = () => dispatch(changeScene(scene + 1))
  const doPrevScene = () => dispatch(changeScene(scene - 1))
  const doLoadResource = (loader, lang) =>
    dispatch(loadResource(filepath, loader, lang))

  return (
    <article className={styles.workbook}>
      <section
        className={styles.layout}
        style={{ left: -100 * (scene - 1) + 'vw' }}
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
    filepath: workbook.filepath,
    workbook: workbook.isLoaded ? workbook.module : undefined,
    resources: state.get('resources'),
    scene: state.get('current'),
  }
}

export default connect(mapStateToProps)(Workbook)