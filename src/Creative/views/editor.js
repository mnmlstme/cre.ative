import React, { useState } from 'react'
import Kr from 'kram'
import ContentEditable from 'react-contenteditable'
import { Highlight } from './highlight.js'

import styles from './document.css'

Prism.manual = true

export function ProseEditor(props) {
  const { className, onChange, onSave } = props
  const [content, setContent] = useState(props.content)

  const keymaps = [proseKeymap, globalKeymap]

  const handleKeyDown = (e) => {
    const fn = resolveKey(e, keymaps)
    fn && fn(e, { content, setContent })
  }

  const handleKeyUp = (e) => {
    // resolve Key Up events to cancel default behaviors
    resolveKey(e, keymaps)
  }

  const handleChange = (e) => {
    const s = e.target.value

    setContent(s)
    onChange(s)
  }

  const handleBlur = onSave

  return (
    <ContentEditable
      className={className}
      tagName="section"
      html={content}
      spellCheck={true}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    />
  )
}

export function CodeEditor(props) {
  const { lang, className, onChange, onSave } = props
  const [content, setContent] = useState(props.content)

  const keymaps = [codeKeymap, globalKeymap]

  const handleKeyDown = (e) => {
    const fn = resolveKey(e, keymaps)
    fn && fn(e, { content, setContent })
  }

  const handleKeyUp = (e) => {
    // resolve Key Up events to cancel default behaviors
    resolveKey(e, keymaps)
  }

  const handleChange = (e) => {
    const s = unescapeHtml(e.target.value)

    setContent(s)
    onChange(s, lang)
  }

  const handleBlur = onSave

  return (
    <figure className={className}>
      <pre className={`language-${lang}`}>
        <Highlight code={content} language={lang} />
        <ContentEditable
          className={styles.codeinput}
          tagName="code"
          lang="zxx"
          spellCheck={false}
          html={escapeHtml(content)}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
      </pre>
      <figcaption>
        <dl className={styles.specs}>
          <dt>Language</dt>
          <dd>{lang}</dd>
        </dl>
      </figcaption>
    </figure>
  )
}

function escapeHtml(unsafe) {
  return unsafe.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function unescapeHtml(safe) {
  return safe.replace(/<br>/g, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
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

const globalKeymap = {
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

const proseKeymap = {}

const codeKeymap = {}

const actions = {
  'do-nothing': () => null,
  finished: ({ target }) => target.blur(),
}
