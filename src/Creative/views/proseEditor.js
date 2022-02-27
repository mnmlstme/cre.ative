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

  blocks.forEach((b) => b.code && unique[b.lang]++)

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
      {blocks.map(({ index, code, tag, html, lang }) => {
        if (typeof code !== 'undefined') {
          return (
            <CodeBlock
              key={index}
              tagName={tag}
              code={code}
              lang={lang}
              onChange={onChange && ((s) => onChange(index, tag, s, lang))}
            />
          )
        } else {
          return (
            <Block
              key={index}
              tagName={tag}
              markBefore={tagToMark(tag)}
              html={markupHTML(html, tag)}
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

const tags = [
  { tag: 'h1', mark: '#', block: true },
  { tag: 'h2', mark: '##', block: true },
  { tag: 'h3', mark: '###', block: true },
  { tag: 'li', mark: '*', block: true, parent: 'ul' },
  { tag: 'li', mark: '1.', block: true, parent: 'ol' },
  { tag: 'strong', mark: '**', inline: true },
  { tag: 'em', mark: '_', inline: true },
  { tag: 'code', mark: '`', inline: true },
]

function tagToMark(tag) {
  const spec = tags.find((t) => t.tag === tag)

  return spec && spec.mark
}

function markToTag(md) {
  const spec = tags.find((t) => t.mark === md)

  return spec && spec.tag
}

function markupTag(tag, parent) {
  const spec = tags.find(
    (t) => t.tag === tag && (!t.parent || parent === t.parent)
  )

  if (spec) {
    const { mark, block, inline } = spec
    const where = block ? 'before' : inline ? 'around' : 'none'

    return `<${tag} data-mark-${where}="${mark}">`
  } else {
    return `<${tag}>`
  }
}

const markupRE = /\<([a-z]+)\>/gi

function markupHTML(html, parent) {
  return html.replace(markupRE, (_, tag) => markupTag(tag, parent))
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
  if (this.backward_select_matching(/\*([^*]+)$/)) {
    this.delete_selected_chars(1)
  } else if (this.forward_select_matching(/^([^*]+)\*/)) {
    this.delete_selected_chars(-1)
  } else {
    this.insert_chars('*')
    return
  }

  this.surround_selection('strong', '**')
}

function hyper_backspace() {
  this.backward_select_chars(1)
  this.delete_selection()
}
