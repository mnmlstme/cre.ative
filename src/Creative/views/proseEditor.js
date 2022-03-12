import React from 'react'
import { Editor, Block } from './editor'
import { CodeBlock, getMinorMode } from './codeEditor'
import { Highlight } from './highlight'

import styles from './prose.css'
import codeStyles from './code.css'
import editorStyles from './editor.css'

export function ProseEditor(props) {
  const { blocks, onChange, onSave } = props
  let unique = {}

  blocks.forEach(([type, attrs]) => type === 'fence' && unique[attrs.lang]++)

  const modes = [proseMode].concat(
    Object.keys(unique).map((lang) => getMinorMode(lang))
  )

  const handleMarkdown = (index, tag, html) => {
    if (onChange) {
      if (tag === 'p') {
        // check for markdown prefix on previously unmarked paragraph
        const sp = html.indexOf(' ')
        const md = sp > 0 ? html.substring(0, sp + 1) : ''
        const newTag = markToTag(md)

        if (newTag) {
          tag = newTag
          html = html.substring(sp + 1)
        }
      }

      onChange(index, tag, html)
    }
  }

  return (
    <Editor
      className={[styles.prose, editorStyles.discuss].join(' ')}
      modes={modes}
      onSave={onSave}
    >
      {blocks.map(([type, attrs, ...rest]) => {
        const { index, tag, markup, lang } = attrs
        if (type === 'fence') {
          return (
            <CodeBlock
              key={index}
              tagName={tag}
              code={rest[0]}
              lang={lang}
              onChange={onChange && ((s) => onChange(index, tag, s, lang))}
            />
          )
        } else {
          return (
            <Block
              key={index}
              tagName={tag}
              markBefore={!type.match(/\w+_list/) && markup}
              html={jsonToHtml(rest)}
              mode="prose-mode"
              spellCheck={true}
              onChange={(s) => handleMarkdown(index, tag, s)}
            />
          )
        }
      })}
    </Editor>
  )
}

function jsonToHtml(tokens) {
  return tokens
    .map((t) => (typeof t === 'string' ? escapeHtml(t) : tokenToHtml(t)))
    .join('')
}

function tokenToHtml([type, attrs, ...children]) {
  const { tag, block, markup, href } = attrs
  const hrefPair = href && ['href', href]
  const markPair = markup &&
    !type.match(/\w+_list/) &&
    markup != '' && [`data-mark-${block ? 'before' : 'around'}`, markup]
  const htmlAttrs = [markPair, hrefPair]
    .filter(Boolean)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('')

  return children
    ? `<${tag}${htmlAttrs}>${jsonToHtml(children)}</${tag}>`
    : `<${tag}${htmlAttrs}/>`
}

function escapeHtml(unsafe) {
  return unsafe.replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
