import React, { useState } from 'react'
import ContentEditable from 'react-contenteditable'
const he = require('he')

import styles from './document.css'

export function Editor(props) {
  const { className, options, keymaps, onChange, onSave } = props
  const [content, setContent] = useState(props.initialContent)

  const apply = (action, event, scope) => action(event, scope)

  const builtins = {
    content,
    setContent,
    saveContent: onSave,
  }

  const handleKeyDown = (e) => {
    const action = resolveKey(e, keymaps)
    action && apply(action, e, builtins)
  }

  const handleKeyUp = (e) => {
    // resolve Key Up events to cancel default behaviors
    resolveKey(e, keymaps)
  }

  const handleChange = (e) => {
    const html = e.target.value
    setContent(html)
    onChange(html)
  }

  const handleBlur = (e) => {
    //debugger
    //onSave(e)
  }

  return (
    <ContentEditable
      className={className}
      tagName={options.tagName || 'code'}
      html={content}
      spellCheck={options.spellCheck}
      lang={options.lang || 'zxx'}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    />
  )
}

function resolveKey(e, keymaps) {
  switch (e.key) {
    case 'Shift':
    case 'Meta':
    case 'Alt':
    case 'Control':
      // ignore modifier keys
      return null
    default:
    // continue
  }

  const found = keymaps.reduce(
    (accum, current) => accum || lookupKey(e, current),
    null
  )

  console.log('Key binding:', found, e)

  const action = found ? actions[found] : null

  if (action) {
    e.preventDefault()
    e.stopPropagation()
    return action
  } else {
    return () => null
  }
}

function lookupKey({ key, shiftKey, ctrlKey, altKey, metaKey }, keymap) {
  const code = [
    altKey && 'Opt-', // Alt on windows
    metaKey && 'Cmd-', // Windows key on windows
    shiftKey && 'S-',
    ctrlKey && '^',
    key,
  ]
    .filter((s) => !!s)
    .join('')

  console.log('Keypress:', code)

  return keymap[code]
}

export const globalKeymap = {
  Tab: 'do-nothing',
  'S-Enter': 'finished',
  // Most (all?) browsers have good defaults for the following.
  // We list them here so we don't accidentally override them.
  ArrowUp: null,
  ArrowDown: null,
  ArrowRight: null,
  ArrowLeft: null,
  Backspace: null,
  'Cmd-x': null,
  'Cmd-v': null,
  'Cmd-c': null,
  'Cmd-z': null,
  '^n': null, // next line
  '^p': null, // previous line
  '^k': null, // kill line
  '^f': null, // forward character
  '^b': null, // backward character
  '^d': null, // delete character
  '^a': null, // beginning of line
  '^e': null, // end of line
  '^v': null, // page down
}

const actions = {
  'do-nothing': () => null,
  finished: (ev, { saveContent }) => saveContent(),
}
