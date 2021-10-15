import React from 'react'
import Kr from 'kram'
import styles from './workbook.css'
import { Editor } from './editor'

export function Document({ workbook }) {
  console.log('Document:', workbook)
  const scenes = workbook.scenes

  return (
    <ol>
      {scenes.map((scn, i) => (
        <li key={i} className={styles.scene}>
          <section className={styles.doc}>
            {scn.doc.map((chunk, i) => (
              <Chunk key={i} {...chunk} />
            ))}
          </section>
          {scn.view && <Editor lang={scn.view.lang} code={scn.view.text} />}
        </li>
      ))}
    </ol>
  )
}

function Chunk({ type, text, depth, lang }) {
  switch (type) {
    case 'heading':
      return <Heading {...{ depth, text }} />
    case 'paragraph':
      return <Paragraph {...{ text }} />
    case 'space':
      return <Space />
    case 'code':
      return <Editor {...{ lang, code: text }} />
    default:
      return <pre>{text}</pre>
  }
}

function Heading({ depth, text }) {
  const h = [
    (s) => <h6>{s}</h6>,
    (s) => <h1>{s}</h1>,
    (s) => <h2>{s}</h2>,
    (s) => <h3>{s}</h3>,
    (s) => <h4>{s}</h4>,
    (s) => <h5>{s}</h5>,
  ]

  return h[depth % 6](text)
}

function Paragraph({ text }) {
  return <p>{text}</p>
}

function Space() {
  return <br />
}
