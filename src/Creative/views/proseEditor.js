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

  console.log('ProseEditor render...')

  const handleMarkdown = (index, tag, html) => {
    if (onChange) {
      if (tag === 'p') {
        // check for markdown prefix on previously unmarked paragraph
        const sp = html.indexOf(' ')
        const md = sp > 0 ? html.substring(0, sp + 1) : ''
        const newTag = markdownPrefixToTagName(md)

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
              html={html}
              mode="prose"
              spellCheck={true}
              onChange={(s) => handleMarkdown(index, tag, s)}
            />
          )
        }
      })}
    </Editor>
  )
}

function markdownPrefixToTagName(md) {
  switch (md) {
    case '# ':
      return 'h1'
    case '## ':
      return 'h2'
    case '### ':
      return 'h3'
    case '* ':
      return 'li'
    case '1. ':
      return 'li'
    default:
      return null
  }
}

const proseMode = {
  name: 'prose-mode',
  description: 'major mode for editing structured text',
  keymaps: [
    {
      '*': hyper_star,
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

  this.surround_selection('strong')
}
