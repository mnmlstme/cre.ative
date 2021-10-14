import React from 'react'
import { connect } from 'react-redux'

import { Document } from './document'
import { Render } from './render'
import { changeScene, loadResource } from '../actions'
import styles from './workbook.css'

const Workbook = ({ workbook, filepath, resources, scene, dispatch }) => {
  const { title, scenes } = workbook
  const doChangeScene = (event) => dispatch(changeScene(event.target.value))
  const doLoadResource = (loader, lang) =>
    dispatch(loadResource(filepath, loader, lang))

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
              {`Scene ${i + 1}` + [scn && scn.title].map((s) => s && `: ${s}`)}
            </option>
          ))}
        </select>
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
