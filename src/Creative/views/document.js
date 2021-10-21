import React from 'react'
import Kr from 'kram'
import styles from './workbook.css'
import ContentEditable from 'react-contenteditable'
import { Editor } from './editor'

export function Document({ workbook, doUpdate, doSave }) {
  console.log('Document:', workbook.toObject())
  const scenes = workbook.get('scenes')

  return (
    <ol>
      {scenes.map((scn, i) => (
        <li key={i} className={styles.scene}>
          <section className={styles.doc}>
            {scn.doc.map((chunk, i) => (
              <Chunk
                key={i}
                {...chunk}
                onChange={(s) => doUpdate(i, s)}
                onBlur={doSave}
              />
            ))}
          </section>
          {scn.view && (
            <Editor
              className={styles.view}
              lang={scn.view.lang}
              code={scn.view.text}
              onChange={(s) => doUpdate('lead', s)}
              onBlur={doSave}
            />
          )}
        </li>
      ))}
    </ol>
  )
}

function Chunk({ type, text, depth, lang, onChange, onBlur }) {
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
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}
