import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useParams, Link, Navigate } from 'react-router-dom'

import { Document } from './document'
import { Render } from './render'
import { changeScene, loadResource, updateScene, saveScene } from '../actions'
import styles from './workbook.css'
import './next.svg'
import './previous.svg'
import './scenes.svg'

function Workbook({ workbook, resources, dispatch }) {
  const { sceneId, slug } = useParams()
  const [showMenu, setShowMenu] = useState(false)

  if (!workbook) {
    return <h1>Loading Workbook ...</h1>
  }

  const title = workbook.get('title')
  const sceneTitles = workbook
    .get('scenes')
    .map((sn, i) => sn.get('title', `Untitled`))
  const scenePath = (i) => {
    const title = sceneTitles.get(i - 1, 'scene')
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^[-]+/, '')
    return `s/${i}/${slug}`
  }

  if (!sceneId) {
    return <Navigate to={scenePath(1)} />
  }

  const scene = Number.parseInt(sceneId) || 1
  const toggleMenu = () => setShowMenu(!showMenu)
  const plugin = workbook.get('plugin')
  const platformName = (plugin && plugin.displayName) || 'Unknown'
  const doUpdateDocument = (blockId, rmNum, ...blocks) =>
    dispatch(updateScene(scene - 1, blockId, rmNum, ...blocks))
  const doSaveDocument = () => dispatch(saveScene(scene - 1))
  const doLoadResource = (defn) => dispatch(loadResource(defn))

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
        <h6>{title}</h6>
        <dl>
          <dt>Platform</dt>
          <dd>{platformName}</dd>
        </dl>
        <nav>
          <NavButton to={toggleMenu} icon="#scenes" mask="#scenes-mask">
            Scene {scene} of {sceneTitles.size}
          </NavButton>
        </nav>
        <nav>
          <NavButton
            to={scenePath(scene - 1)}
            icon="#previous"
            mask="#previous-mask"
            disabled={scene <= 1}
          />
          <NavButton
            to={scenePath(scene + 1)}
            icon="#next"
            mask="#next-mask"
            disabled={scene >= sceneTitles.size}
          />
        </nav>
        {showMenu && (
          <ol className={styles.toc} onClick={toggleMenu}>
            {sceneTitles.map((title, i) => (
              <li key={i}>
                <Link to={scenePath(i + 1)}>{title}</Link>
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

function NavButton({ to, icon, mask, children, disabled = false }) {
  const onClick = typeof to === 'function' && to

  return !onClick && !disabled ? (
    <Link to={to} className={styles.button}>
      <SvgUse href={icon} /> {children ? <span>{children}</span> : null}
    </Link>
  ) : (
    <button
      disabled={disabled}
      className={styles.button}
      onClick={onClick || undefined}
    >
      <SvgUse href={icon} /> {children ? <span>{children}</span> : null}
    </button>
  )
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')

  console.log('Connecting workbook state:', workbook)

  return {
    workbook: workbook.get('isLoaded') ? workbook : undefined,
    resources: state.get('resources'),
  }
}

export default connect(mapStateToProps)(Workbook)
