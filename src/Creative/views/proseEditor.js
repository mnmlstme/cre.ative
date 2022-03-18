import React from 'react'
import { Block } from './block'
import { Editor } from './editor'
import { CodeBlock, getMinorMode } from './codeEditor'
import { Highlight } from './highlight'

import styles from './prose.css'
import codeStyles from './code.css'
import editorStyles from './editor.css'

export function ProseEditor(props) {
  const { blocks, doUpdate, doSave } = props
  let unique = {}

  blocks.forEach(([type, attrs]) => type === 'fence' && unique[attrs.lang]++)

  const modes = [proseMode].concat(
    Object.keys(unique).map((lang) => getMinorMode(lang))
  )

  const handleMarkdown = (index, tag, html) => {}

  return (
    <Editor
      className={[styles.prose, editorStyles.discuss].join(' ')}
      modes={modes}
      onSave={doSave}
    >
      {blocks.map((b) => {
        const [type, attrs, ...rest] = b
        const { index, tag, markup, lang } = attrs

        if (type === 'fence') {
          return (
            <CodeBlock
              key={index}
              block={b}
              onChange={(b) => doUpdate && doUpdate(index, b)}
            />
          )
        } else {
          return (
            <Block
              key={index}
              block={b}
              mode="prose-mode"
              onChange={(b) => doUpdate && doUpdate(index, b)}
            />
          )
        }
      })}
    </Editor>
  )
}

const proseMode = {
  name: 'prose-mode',
  description: 'major mode for editing structured text',
  keymaps: [
    {
      '*': hyper_star,
      Backspace: hyper_backspace,
    },
  ],
  bindings: [hyper_star],
}

function hyper_star() {
  if (!this.selection_is_empty()) {
    this.surround_selection('em', '*')
  } else {
    this.insert_markup('em', '*')
  }
}

function hyper_backspace() {
  this.backward_select_chars(1)
  this.delete_selection()
}
