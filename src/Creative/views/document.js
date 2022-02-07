import React from 'react'
import styles from './document.css'
import { CodeEditor, escapeHtml } from './codeEditor'
import { ProseEditor } from './proseEditor'
import codeStyles from './code.css'

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
        const discussion = scn.blocks
          .filter((b) => b.mode !== 'eval')
          .map((b) => (b.mode === 'discuss' ? b.text : wrapCode(b)))
          .join('')

        return (
          <li key={i} className={styles.doc}>
            <ProseEditor
              mode="discuss"
              content={discussion}
              // onChange={(s, lang) => doUpdate(index, mode, s, lang)}
              doSave={doSave}
            />
            <CodeEditor
              mode={perform.mode}
              lang={perform.lang}
              content={perform.text}
              onChange={(s, lang) => doUpdate(perform.index, mode, s, lang)}
              onSave={doSave}
            />
          </li>
        )
      })}
    </ol>
  )
}

function wrapCode({ text, lang, mode }) {
  const code = escapeHtml(text)

  return `<pre lang=${lang}><code class="language-${lang}">${code}</code></pre>\n`
}
