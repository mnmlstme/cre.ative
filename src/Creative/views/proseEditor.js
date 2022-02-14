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

  return (
    <Editor
      className={[styles.prose, editorStyles.discuss].join(' ')}
      keymaps={[proseKeymap]}
      provides={[]}
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
                onChange={onChange && ((s) => onChange(index, tag, s))}
              />
            )
        }
      })}
    </Editor>
  )
}

function styleBlock() {
  const blocks = this.getBlocksInFocus()

  const fmt = (tag, parentTag) => () =>
    blocks.map((el) => {
      if (el.tagName !== tag) {
        this.saveExcursion(() => {
          const parentEl = el.parentNode

          let replacement = document.createElement(tag)
          el.before(replacement)

          while (el.firstChild) {
            replacement.appendChild(el.firstChild)
          }

          if (parentTag && (!parentEl || parentTag !== parentEl.tagName)) {
            let newParent = document.createElement(parentTag)
            el.before(newParent)
            newParent.appendChild(replacement)
          }

          el.remove()
        })
      }
    })

  const styleOptions = [
    {
      key: 'p',
      action: fmt('p'),
      label: 'P',
      description: 'Style as Paragraph.',
    },
    {
      key: '1',
      action: fmt('h1'),
      label: 'H1',
      description: 'Style as Top-level Heading',
    },
    {
      key: '2',
      action: fmt('h2'),
      label: 'H2',
      description: 'Style as 2nd-level Heading',
    },
    {
      key: '3',
      action: fmt('h3'),
      label: 'H3',
      description: 'Style as 3rd-level Heading',
    },
    {
      key: '*',
      action: fmt('li', 'ul'),
      label: '• —',
      description: 'Style as Bulleted List',
    },
    {
      key: '#',
      action: fmt('li', 'ol'),
      label: '# —',
      description: 'Style as Numbered List',
    },
    {
      key: 'Escape',
      action: this.doNothing,
      label: 'X',
      description: 'Escape and close popup.',
    },
  ]

  this.promptWithOptions(styleOptions)
}

const proseKeymap = {
  '^/': { on: 'keyup', fn: styleBlock },
}
