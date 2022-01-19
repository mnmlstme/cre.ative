import React, { useState } from 'react'
import { Editor, globalKeymap } from './editor.js'
import { Highlight } from './highlight.js'

import Prism from 'prismjs'
import theme from 'prismjs/themes/prism-funky.css'
import styles from './code.css'

Prism.manual = true

export function CodeEditor(props) {
  const { mode, lang, content, onChange, onSave } = props

  const keymaps = [languages[lang] || {}, codeKeymap, globalKeymap]
  const options = {
    tagName: 'code',
    spellCheck: false,
    lang,
  }

  const handleChange = (s) => {
    onChange(rawCode(s), lang)
  }

  const handleSave = (s) => {
    onSave(rawCode(s))
  }

  function tidy(html, start, end, change, was) {
    console.log('CodeEditor#tidy:', start, end, change, was)
    return highlightCode(rawCode(html), lang)
  }

  return (
    <figure className={styles[mode]}>
      <pre className={`language-${lang}`}>
        <Editor
          className={styles.code}
          options={options}
          keymaps={keymaps}
          content={highlightCode(content, lang)}
          onChange={handleChange}
          onSave={handleSave}
          onUpdate={tidy}
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

function rawCode(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const code = doc.body.innerText

  console.log('CodeEditor changed:', code)

  return code
}

function highlightCode(code, lang) {
  return Prism.highlight(code, Prism.languages[lang], lang)
    .replace(/\<span class="([\sa-z-]+)"\>/g, replaceThemeClasses)
    .split('\n')
    .map((line) => `<span class="${styles.line}">${line}</span>`)
    .join('\n')
}

function replaceThemeClasses(match, className) {
  const classes = className
    .split(/\s+/)
    .map((cls) => theme[cls] || cls)
    .join(' ')

  return match.replace(className, classes)
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
