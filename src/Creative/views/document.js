import React from 'react'
import styles from './document.css'
import { Editor } from './editor'

export function Document({ workbook, doUpdate, doSave }) {
  console.log('Document:', workbook.toObject())
  const scenes = workbook.get('scenes')
  return (
    <ol>
      {scenes.map((scn, i) => {
        const view = scn.blocks.find((b) => b.mode === 'perform')
        const blocks = scn.blocks.filter((b) => b.mode !== 'perform')

        return (
          <li key={i} className={styles.doc}>
            {blocks.map((blk, i) =>
              blk.mode === 'remark' ? (
                <Editor
                  key={i}
                  className={styles.remark}
                  lang={blk.lang}
                  code={blk.text}
                  wysiwyg={true}
                  onChange={(s) => doUpdate(i, blk.mode, s, 'html')}
                  onExit={doSave}
                />
              ) : (
                <Editor
                  key={i}
                  className={styles.compose}
                  lang={blk.lang}
                  code={blk.text}
                  highlight={true}
                  onChange={(s, lang) => doUpdate(i, blk.mode, s, lang)}
                  onExit={doSave}
                />
              )
            )}
            {view && (
              <Editor
                key="perform"
                className={styles.perform}
                lang={view.lang}
                code={view.text}
                highlight={true}
                onChange={(s, lang) => doUpdate(i, view.mode, s, lang)}
                onExit={doSave}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
