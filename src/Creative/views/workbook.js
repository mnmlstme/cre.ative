import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useParams, Link } from 'react-router-dom'

import { Document } from './document'
import { Render } from './render'
import { changeScene, loadResource, updateScene, saveScene } from '../actions'
import styles from './workbook.css'
import './next.svg'
import './next-mask.svg'
import './previous.svg'
import './previous-mask.svg'
import './scenes.svg'
import './scenes-mask.svg'
import './stripes.svg'

function Workbook({ workbook, scene, resources, dispatch }) {
  const { projectId, workbookId, sceneId } = useParams()

  const [showMenu, setShowMenu] = useState(false)
  const toggleMenu = () => setShowMenu(!showMenu)

  if (!workbook) {
    // dispatch(loadWorkbook(projectId, workbookId))
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
        <svg viewBox="0 0 32 28" preserveAspectRatio="none">
          <use xlinkHref="#stripes" />
        </svg>
        <nav>
          <NavButton
            to={`${slug}/${scene - 1}`}
            icon="#previous"
            mask="#previous-mask"
            disabled={scene <= 1}
          />
          <NavButton
            to={`${slug}/${scene + 1}`}
            icon="#next"
            mask="#next-mask"
            disabled={scene >= sceneTitles.size}
          />
          <span className={styles.spacer} />
          <h6>{title || workbookId}</h6>
          <NavButton to={toggleMenu} icon="#scenes" mask="#scenes-mask" />
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

function SvgUse({ href }) {
  return (
    <svg>
      <use xlinkHref={href} />
    </svg>
  )
}

function NavButton({ to, icon, mask, disabled = false }) {
  const onClick = typeof to === 'function' && to

  return (
    <div className={styles.segment}>
      <SvgUse href={mask} />
      {!onClick && !disabled ? (
        <Link to={to} className={styles.button}>
          <SvgUse href={icon} />
        </Link>
      ) : (
        <button
          disabled={disabled}
          className={styles.button}
          onClick={onClick || undefined}
        >
          <SvgUse href={icon} />
        </button>
      )}
    </div>
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
