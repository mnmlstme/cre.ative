import React, { useState } from 'react'
import ContentEditable from 'react-contenteditable'
const he = require('he')

import styles from './document.css'

export function Editor(props) {
  const {
    className,
    tagName,
    options,
    keymaps,
    onUpdate,
    onChange,
    onSave,
  } = props
  const [content, setContent] = useState(props.content)

  const handleKeyDown = (e) => {
    const fn = resolveKey(e, keymaps)
    fn && fn(e, { content, setContent })
  }

  const handleKeyUp = (e) => {
    // resolve Key Up events to cancel default behaviors
    resolveKey(e, keymaps)
  }

  const handleChange = (e) => {
    const value = he.decode(e.target.value)
    const prior = he.decode(content)
    const shortest = Math.min(prior.length, value.length)

    let start = 0
    while (start < shortest && value[start] === prior[start]) {
      if (value[start] === '<') {
        const vtag = parse_tag_forward(value, start)
        const ptag = parse_tag_forward(prior, start)
        if (vtag === ptag) {
          start += vtag.length
        } else {
          break
        }
      } else {
        start++
      }
    }

    let end = -1
    while (
      shortest + end > start &&
      value[value.length + end] === prior[prior.length + end]
    ) {
      if (value[value.length + end] === '>') {
        const vtag = parse_tag_backward(value, end)
        const ptag = parse_tag_backward(prior, end)
        console.log('parse_tag_backward:', end, vtag, ptag)
        if (vtag === ptag) {
          end -= vtag.length
        } else {
          end++
          break
        }
      } else {
        end--
      }
    }

    const s = onUpdate(
      value,
      start,
      value.length + end + 1,
      value.slice(start, value.length + end + 1),
      prior.slice(start, prior.length + end + 1)
    )

    console.log('onUpdate returns ', s)

    setContent(s)
    onChange(s)
  }

  const handleBlur = (e) => {
    //debugger
    onSave(e)
  }

  return (
    <ContentEditable
      className={className}
      tagName={options.tagname || 'code'}
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

function parse_tag_forward(s, start) {
  // TODO: make tag parsing more robust
  const end = s.indexOf('>', start + 1)

  return s.slice(start, end + 1)
}

function parse_tag_backward(s, end) {
  // TODO: make tag parsing more robust
  let start = end - 1

  if (start < 0) {
    start = s.length + start
  }

  while (start > 0 && s[start] !== '<') {
    start--
  }

  return s.slice(start, end + 1)
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
  finished: ({ target }) => target.blur(),
}
