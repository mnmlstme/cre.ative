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
import './previous.svg'
import './next.svg'
import './scenes.svg'

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

  if (sceneId && scene != sceneId) {
    scene = Number.parseInt(sceneId)
    dispatch(changeScene(scene))
  }

  const title = workbook.get('title')
  const slug = title.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const sceneTitles = workbook
    .get('scenes')
    .map((sn, i) => sn.get('title', `Untitled`))
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
          {scene > 1 ? (
            <Link to={`${slug}/${scene - 1}`} className={styles.button}>
              <svg>
                <use xlinkHref="#previous" />
              </svg>
            </Link>
          ) : (
            <button disabled className={styles.button}>
              <svg>
                <use xlinkHref="#previous" />
              </svg>
            </button>
          )}
          {scene < sceneTitles.size ? (
            <Link
              to={`${slug}/${scene + 1}`}
              className={[styles.next, styles.button].join(' ')}
            >
              <svg>
                <use xlinkHref="#next" />
              </svg>
            </Link>
          ) : (
            <button disabled className={[styles.next, styles.button].join(' ')}>
              <svg>
                <use xlinkHref="#previous" />
              </svg>
            </button>
          )}
          <span className={styles.spacer} />
          <h6>{title || workbookId}</h6>
          <button
            className={[styles.menu, styles.button].join(' ')}
            onClick={toggleMenu}
          >
            <svg>
              <use xlinkHref="#scenes" />
            </svg>
          </button>
        </nav>
        {showMenu && (
          <ol className={styles.toc} onClick={toggleMenu}>
            {sceneTitles.map((title, i) => (
              <li key={i}>
                <Link to={`${slug}/${i + 1}`}>{title}</Link>
              </li>
            ))}
          </ol>
        )}
      </footer>
    </article>
  )
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')

  return {
    workbook: workbook.get('isLoaded') ? workbook : undefined,
    resources: state.get('resources'),
    scene: Number.parseInt(state.get('current')),
  }
}

export default connect(mapStateToProps)(Workbook)
