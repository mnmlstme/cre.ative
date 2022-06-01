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
    const blk = b.toArray()
    const [type, { lang }] = blk
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
      {blocks.map((b) => (
        <Node block={b.toArray()} onUpdate={doUpdate} />
      ))}
    </Editor>
  )
}

function Node(props) {
  const { block, path, onUpdate } = props
  const [type, { tag, uniqueId }, ...rest] = block
  const childPath = (path || []).concat([uniqueId])

  switch (type) {
    case 'fence':
      return <CodeBlock key={uniqueId} block={block} onUpdate={onUpdate} />
    case 'bullet_list':
    case 'ordered_list':
    case 'list_item':
      return React.createElement(
        tag,
        { key: uniqueId, path: childPath },
        rest.map((b) => {
          const block = b.toArray()
          const [_, { uniqueId }] = block

          return (
            <Node
              key={uniqueId}
              block={block}
              path={childPath}
              onUpdate={onUpdate}
            />
          )
        })
      )
    default:
      return (
        <Block
          key={uniqueId}
          path={childPath}
          block={block}
          mode="prose-mode"
          onUpdate={onUpdate}
        />
      )
  }
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
