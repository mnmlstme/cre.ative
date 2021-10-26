import React from 'react'
import Kr from 'kram'
import styles from './document.css'
import ContentEditable from 'react-contenteditable'
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
                <Remark
                  key={i}
                  block={blk}
                  onChange={(s) => doUpdate(i, blk.mode, s)}
                  onBlur={doSave}
                />
              ) : (
                <Editor
                  key={i}
                  className={styles.compose}
                  lang={blk.lang}
                  code={blk.text}
                  // onBlur={doSave}
                  // onChange={(s, lang) => doUpdate(i, blk.mode, s, lang)}
                />
              )
            )}
            {view && (
              <Editor
                key="perform"
                className={styles.perform}
                lang={view.lang}
                code={view.text}
                //onChange={(s, lang) => doUpdate(i, view.mode, s, lang)}
                //onBlur={doSave}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Remark({ block, onBlur, onChange }) {
  // const [tag, cls] = {
  //   heading: [`h${depth}`, styles.heading],
  //   paragraph: ['p', ''],
  //   space: ['p', styles.blank],
  //   code: ['code', `language-${lang} ${styles.code}`],
  //   _: ['pre', ''],
  // }[type || '_']

  return (
    <ContentEditable
      className={styles.remark}
      tagName="section"
      html={Kr.format(block) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}
