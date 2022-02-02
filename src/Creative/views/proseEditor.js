import React from 'react'
import { Editor } from './editor.js'
import styles from './prose.css'

export function ProseEditor(props) {
  const { className, content, onChange, onSave } = props

  console.log('ProseEditor render...')

  return (
    <Editor
      className={styles.prose}
      tagName="section"
      spellCheck={true}
      initialContent={content}
      keymaps={[proseKeymap]}
      bindings={[proseBindings]}
      onChange={onChange}
      onSave={onSave}
    />
  )
}

const proseKeymap = {
  '^/': 'style-block',
}

const proseBindings = {
  'style-block': {
    on: 'keyup',
    fn: ({ invoke }) => {
      const blocks = invoke('get-blocks-in-focus')

      invoke(
        'user-select-action',
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
        }
      )

      function fmt(tag, parentTag) {
        return () => {
          blocks.map((el) => invoke('modify-block-tag', tag, parentTag, el))
        }
      }
    },
  },
}
