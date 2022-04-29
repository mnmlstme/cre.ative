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
        const perform = blocks.find(
          ([type, attrs]) => type === 'fence' && attrs.mode === 'eval'
        ) || ['fence', { mode: 'eval' }, '']
        const discussion = blocks.filter(
          ([type, attrs]) => type !== 'fence' || attrs.mode !== 'eval'
        )

        return (
          <li key={i} className={styles.doc}>
            <ProseEditor
              blocks={discussion}
              doUpdate={doUpdate}
              doSave={doSave}
            />
            <CodeEditor block={perform} doUpdate={doUpdate} doSave={doSave} />
          </li>
        )
      })}
    </ol>
  )
}
