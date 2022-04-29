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

  blocks.forEach((b) => {
    const [type, { lang }] = b
    if (type === 'fence') {
      unique[lang] = lang
    }
  })

  const modes = [proseMode].concat(Object.keys(unique).map(getMinorMode))

  return (
    <Editor
      className={[styles.prose, editorStyles.discuss].join(' ')}
      modes={modes}
      onSave={doSave}
    >
      {blocks.map((b, i) => {
        const [type, { uniqueId }, ...rest] = b

        if (type === 'fence') {
          return <CodeBlock key={uniqueId} block={b} onUpdate={doUpdate} />
        } else {
          return (
            <Block
              key={uniqueId}
              block={b}
              mode="prose-mode"
              onUpdate={doUpdate}
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
      Enter: hyper_enter,
    },
  ],
  bindings: [hyper_backspace, hyper_enter, hyper_star],
}

function hyper_star() {
  if (this.selection_is_empty()) {
    this.insert_markup('em', '*')
  } else {
    this.surround_selection('em', '*')
  }
}

function hyper_backspace() {
  this.backward_select_chars(1)
  this.delete_selection()
}

function hyper_enter() {
  this.select_to_end_of_block()
  this.extract_selection()
}
