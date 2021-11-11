import React from 'react'
import styles from './document.css'
import { Editor } from './editor'

export function Document({ workbook, doUpdate, doSave }) {
  console.log('Document:', workbook.toObject())
  const scenes = workbook.get('scenes')

  return (
    <ol>
      {scenes.map((scn, i) => {
        return (
          <li key={i} className={styles.doc}>
            {scn.blocks
              .map((blk, j) => Object.assign(blk, { index: j }))
              .sort(performLast)
              .map(({ index, mode, lang, text }) => (
                <Editor
                  key={index}
                  className={styles[mode]}
                  lang={lang}
                  code={text}
                  highlight={mode !== 'remark'}
                  wysiwyg={mode === 'remark'}
                  onChange={(s, lang) => doUpdate(index, mode, s, lang)}
                  onSave={doSave}
                />
              ))}
          </li>
        )
      })}
    </ol>
  )
}

function performLast(a, b) {
  return a.mode === b.mode || (b.mode !== 'perform' && a.mode !== 'perform')
    ? a > b
    : a.mode === 'perform'
    ? 1
    : -1
}
