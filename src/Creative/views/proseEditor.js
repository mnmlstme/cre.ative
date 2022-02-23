import React from 'react'
import { Editor, Block } from './editor'
import { CodeBlock } from './codeEditor'
import { Highlight } from './highlight'
import styles from './prose.css'
import codeStyles from './code.css'
import editorStyles from './editor.css'

export function ProseEditor(props) {
  const { blocks, onChange, onSave } = props

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
      keymaps={[proseKeymap]}
      provides={proseBindings}
      onSave={onSave}
    >
      {blocks.map(({ index, mode, code, tag, html, lang }) => {
        switch (mode) {
          case 'eval':
          case 'define':
            return (
              <CodeBlock
                key={index}
                tagName={tag}
                code={code}
                lang={lang}
                onChange={onChange && ((s) => onChange(index, tag, s, lang))}
              />
            )
          default:
            return (
              <Block
                key={index}
                tagName={tag}
                html={html}
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

const proseKeymap = {
  '*': hyper_star,
}

const proseBindings = [hyper_star]

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
