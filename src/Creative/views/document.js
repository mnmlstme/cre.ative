import React from 'react'
import styles from './document.css'
import { ProseEditor } from './proseEditor'
import { CodeEditor } from './codeEditor'

export function Document({ workbook, doUpdate, doSave }) {
  console.log('Document:', workbook.toObject())
  const scenes = workbook.get('scenes')

  return (
    <ol>
      {scenes.map((scn, i) => {
        const blocks = scn.get('blocks')
        const perform = blocks.find((b) => b.mode === 'eval')
        const discussion = blocks.filter((b) => b.mode !== 'eval')

        return (
          <li key={i} className={styles.doc}>
            <ProseEditor
              blocks={discussion}
              onChange={doUpdate}
              onSave={doSave}
            />
            <CodeEditor block={perform} onChange={doUpdate} />
          </li>
        )
      })}
    </ol>
  )
}
