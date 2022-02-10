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
        const blocks = scn.blocks.map((blk, j) =>
          Object.assign(blk, { index: j })
        )
        const perform = scn.blocks.find((b) => b.mode === 'eval')
        const discussion = scn.blocks.filter((b) => b.mode !== 'eval')

        return (
          <li key={i} className={styles.doc}>
            <ProseEditor
              blocks={discussion}
              // onChange={(s, lang) => doUpdate(index, mode, s, lang)}
              // doSave={doSave}
            />
            <CodeEditor
              block={perform}
              // onChange={(s, lang) => doUpdate(perform.index, mode, s, lang)}
              // onSave={doSave}
            />
          </li>
        )
      })}
    </ol>
  )
}
