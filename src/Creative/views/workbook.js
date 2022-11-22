import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useParams, Link } from 'react-router-dom'

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

function Workbook({ workbook, scene, resources, dispatch }) {
  const { projectId, workbookId, sceneId } = useParams()

  const [showMenu, setShowMenu] = useState(false)
  const toggleMenu = () => setShowMenu(!showMenu)

  if (!workbook) {
    dispatch(loadWorkbook(projectId, workbookId))
    return <h1>Loading {workbookId} ...</h1>
  }

  if (!scene) {
    scene = 1
  }

  if (sceneId && scene !== sceneId) {
    scene = sceneId
    dispatch(changeScene(scene))
  }

  const title = workbook.get('title')
  const sceneTitles = workbook
    .get('scenes')
    .map((sn, i) => sn.get('title', `Untitled`))
  const doChangeScene = (event) => dispatch(changeScene(event.target.value))
  const doNextScene = () => dispatch(changeScene(scene + 1))
  const doPrevScene = () => dispatch(changeScene(scene - 1))
  const doUpdateDocument = (blockId, rmNum, ...blocks) =>
    dispatch(updateScene(scene - 1, blockId, rmNum, ...blocks))
  const doSaveDocument = () => dispatch(saveScene(scene - 1))
  const doLoadResource = (defn) => dispatch(loadResource(defn))

  console.log('Scenes:', sceneTitles)

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
          scene={scene}
          workbook={workbook}
          resources={resources}
          doLoadResource={doLoadResource}
        />
      </section>
      <footer className={styles.menubar}>
        <nav>
          <button
            className={styles.previous}
            disabled={scene - 1 < 1}
            onClick={doPrevScene}
          />
          <button
            className={styles.next}
            disabled={scene >= sceneTitles.length}
            onClick={doNextScene}
          />
          <span className={styles.spacer} />
          <h6>{title || workbookId}</h6>
          <button className={styles.menu} onClick={toggleMenu} Menu />
        </nav>
        {showMenu && (
          <ol className={styles.toc}>
            {sceneTitles.map((title, i) => (
              <li key={i}>
                <Link to={`${titleToSlug(title)}/${i + 1}`}>{title}</Link>
              </li>
            ))}
          </ol>
        )}
      </footer>
    </article>
  )
}

function titleToSlug(s) {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, '-')
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')

  return {
    workbook: workbook.get('isLoaded') ? workbook : undefined,
    resources: state.get('resources'),
    scene: state.get('current'),
  }
}

export default connect(mapStateToProps)(Workbook)
