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
      content={content}
      keymaps={keymaps}
      onChange={onChange}
      onSave={onSave}
      onUpdate={tidy}
    />
  )
}

function tidy(content, start, end, change, was) {
  console.log('ProseEditor#tidy:', start, end, change, was)

  // remove redundant <br> before an end tag
  change = change.replace(/<br><\/(div|p|h1|h2|h3|li)>/, '</$1>')

  return content.slice(0, start) + change + content.slice(end)
}
const proseKeymap = {}
