import React from 'react'
import { Editor, globalKeymap } from './editor.js'
import styles from './prose.css'
export function ProseEditor(props) {
  const { className, content, onChange, onSave } = props

  const keymaps = [proseKeymap, globalKeymap]
  const options = {
    tagName: 'section',
    spellCheck: true,
  }

  return (
    <Editor
      className={styles.prose}
      options={options}
      initialContent={content}
      keymaps={keymaps}
      onChange={onChange}
      onSave={onSave}
    />
  )
}

const proseKeymap = {}
