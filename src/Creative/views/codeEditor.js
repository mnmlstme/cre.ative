import React, { useState } from 'react'
import { Editor, globalKeymap } from './editor.js'
import { Highlight } from './highlight.js'

import styles from './code.css'

Prism.manual = true

export function CodeEditor(props) {
  const { mode, lang, content, onChange, onSave } = props
  const [transient, setTransient] = useState(content)
  const keymaps = [languages[lang] || {}, codeKeymap, globalKeymap]
  const options = {
    tagName: 'code',
    spellCheck: false,
    lang,
  }

  const handleChange = (html) => {
    const s = unescapeHtml(html)
    setTransient(s)
    onChange(s, lang)
  }

  return (
    <figure className={styles[mode]}>
      <pre className={`language-${lang}`}>
        <Highlight code={transient} language={lang} />
        <Editor
          className={styles.code}
          options={options}
          keymaps={keymaps}
          initialContent={escapeHtml(content)}
          onChange={handleChange}
          onSave={onSave}
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

const codeKeymap = {}

// TODO: plugin architecture for languages
const jsKeymap = {}
const jsxKeymap = jsKeymap
const elmKeymap = {}

const languages = {
  js: jsKeymap,
  jsx: jsxKeymap,
  elm: elmKeymap,
}
