import React from 'react'
import { Editor, globalKeymap } from './editor.js'

export function ProseEditor(props) {
  const { className, content, onChange, onSave } = props

  const keymaps = [proseKeymap, globalKeymap]
  const options = {
    tagName: 'section',
    spellCheck: true,
  }

  return (
    <Editor
      className={className}
      options={options}
      content={content}
      keymaps={keymaps}
      onChange={onChange}
      onSave={onSave}
      onUpdate={tidy}
    />
  )
}

function tidy(content, start, end, replacement, was) {
  console.log('ProseEditor#tidy:', start, end, replacement, was)

  // Here we try to catch and normalize all the crazy things browsers put in.
  // TODO: a more holistic approach to this.

  switch (replacement) {
    case '<div><br></div>':
    case '<div><br></div>\n':
      replacement = '<p></p>\n'
      break
    case '</p><p>':
    case '<br></p><p>':
    case ' <br></p><p>':
      replacement = '</p>\n<p>'
      break
    case '</h1><h1>':
    case '<br></h1><h1>':
    case ' <br></h1><h1>':
      replacement = '</h1>\n<h1>'
      break
  }

  return content.slice(0, start) + replacement + content.slice(end)
}
const proseKeymap = {}
