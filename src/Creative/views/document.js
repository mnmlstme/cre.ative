import React from 'react'
import Kr from 'kram'
import styles from './workbook.css'
import ContentEditable from 'react-contenteditable'
import { Editor } from './editor'

export function Document({ workbook, changeContent, saveContent }) {
  console.log('Document:', workbook)
  const scenes = workbook.scenes

  return (
    <ol>
      {scenes.map((scn, i) => (
        <li key={i} className={styles.scene}>
          <section className={styles.doc}>
            {scn.doc.map((chunk, i) => (
              <Chunk
                key={i}
                {...chunk}
                changeContent={changeContent}
                saveContent={saveContent}
              />
            ))}
          </section>
          {scn.view && (
            <Editor
              className={styles.view}
              lang={scn.view.lang}
              code={scn.view.text}
            />
          )}
        </li>
      ))}
    </ol>
  )
}

function Chunk({ type, text, depth, lang, changeContent, saveContent }) {
  const [tag, cls] = {
    heading: [`h${depth}`, styles.heading],
    paragraph: ['p', ''],
    space: ['p', styles.blank],
    code: ['code', `language-${lang} ${styles.code}`],
    _: ['pre', ''],
  }[type || '_']

  return (
    <ContentEditable
      className={cls}
      tagName={tag}
      html={text || ''}
      changeCode={changeContent}
      saveCode={saveContent}
    />
  )
}
