import React, { useState } from 'react'
import { Editor, globalKeymap } from './editor.js'
import { Highlight } from './highlight.js'

import styles from './code.css'

Prism.manual = true

export function CodeEditor(props) {
  const { mode, lang, onChange, onSave } = props
  const [content, setContent] = useState(props.content)

  const keymaps = [languages[lang] || {}, codeKeymap, globalKeymap]
  const options = {
    tagName: 'code',
    spellCheck: false,
  }

  return (
    <figure className={styles[mode]}>
      <pre className={`language-${lang}`}>
        <Highlight code={content} language={lang} />
        <Editor
          className={styles.codeinput}
          options={options}
          keymaps={keymaps}
          content={escapeHtml(content)}
          onChange={onChange}
          onSave={onSave}
          onUpdate={(s) => {
            const t = tidy(s)
            setContent(t)
            return t
          }}
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

function tidy(content) {
  return unescapeHtml(content)
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
