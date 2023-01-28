import React from 'react'
import { ProseEditor } from './proseEditor'
import { CodeEditor } from './codeEditor'
import frameStyles from './frame.css'
import styles from './document.css'

export function Document({ workbook, doUpdate, doSave }) {
  //console.log('Document:', workbook.toObject())
  const scenes = workbook.get('scenes')

  return (
    <ol>
      {scenes.map((scn, i) => {
        const blocks = scn.get('blocks')
        const performance = blocks.filter((b) => {
          const type = b.get(0)
          const mode = b.get(1)['mode']

          return type === 'fence' && mode === 'eval'
        })
        const discussion = blocks.filter((b) => {
          const type = b.get(0)
          const mode = b.get(1)['mode']

          return type !== 'fence' || mode !== 'eval'
        })

        return (
          <li
            key={i}
            className={[
              styles.doc,
              frameStyles.frame,
              frameStyles.fixedHeight,
              frameStyles.yScrollable,
            ].join(' ')}
            style={{
              '--fixedHeight': '200%',
            }}
          >
            <ProseEditor
              blocks={discussion}
              doUpdate={doUpdate}
              doSave={doSave}
            />
            <CodeEditor
              blocks={performance}
              doUpdate={doUpdate}
              doSave={doSave}
            />
          </li>
        )
      })}
    </ol>
  )
}
