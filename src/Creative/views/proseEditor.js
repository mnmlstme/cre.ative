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
  '^/': 'format-paragraph',
}

const proseBindings = {
  'format-paragraph': {
    on: 'keyup',
    fn: ({ invoke }) => {
      const root = invoke('get-root-node')
      const selection = invoke('get-selection')
      const blocks = selectedBlocks(selection, root)

      invoke(
        'user-select-action',
        { key: 'p', action: fmt('p'), name: 'Paragraph' },
        { key: '1', action: fmt('h1'), name: 'Heading 1' },
        { key: '2', action: fmt('h2'), name: 'Heading 2' },
        { key: '3', action: fmt('h3'), name: 'Heading 3' },
        { key: '*', action: fmt('li', 'ul'), name: 'Bullet List' },
        { key: '#', action: fmt('li', 'ol'), name: 'Numbered List' }
      )

      function fmt(tag, parentTag) {
        return () => {
          blocks.map((el) => {
            if (el.tagName !== tag) {
              debugger
              const newEl = document.createElement(tag)
              newEl.innerHTML = el.innerHTML
              if (parentTag && parentTag !== el.parentNode.tagName) {
                const newParent = document.createElement(parentTag)
                newParent.appendChild(newEl)
                el.replaceWith(newParent)
              } else {
                el.replaceWith(newEl)
              }
            }
          })
        }
      }
    },
  },
}

function closestBlock(el, root) {
  while (el && el.nodeType !== 1 /* ELEMENT_NODE */) {
    el = el.parentNode
  }

  if (el) {
    el = el.closest('section,div,p,h1,h2,h3,li')
  }

  return el === root ? null : el
}

function selectedBlocks(selection, root) {
  let range = [
    closestBlock(selection.anchorNode),
    closestBlock(selection.focusNode),
  ].filter((n) => !!n)

  if (
    range.length > 1 &&
    range[1] !== range[0].nextSibling &&
    range[0] !== range[1].nextSibling
  ) {
    if (range[0] === range[1]) {
      range = range.slice(1)
    } else {
      // insert all elements in between
    }
  }

  console.log('Selected Blocks:', range)
  return range
}
