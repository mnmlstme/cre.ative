import React from 'react'
import { Editor, Block, coreKeymap } from './editor.js'
import { Highlight } from './highlight.js'

import styles from './code.css'

export function CodeEditor(props) {
  const { block, onChange, onSave } = props
  const { index, mode, lang, text } = block
  const keymaps = [languages[lang] || {}, codeKeymap]

  console.log('CodeEditor render...')

  return (
    <Editor
      className={styles[mode]}
      keymaps={keymaps}
      provides={{}}
      onSave={onSave}
    >
      <CodeBlock
        code={text}
        lang={lang}
        onChange={onChange && ((code) => onChange(index, mode, code, lang))}
      />
      <footer>
        <dl className={styles.specs}>
          <dt>Language</dt>
          <dd>{lang}</dd>
        </dl>
      </footer>
    </Editor>
  )
}

export function CodeBlock({ code, lang, onChange }) {
  return (
    <pre lang={lang} className={`language-${lang}`}>
      <Block
        tagName="code"
        className={styles.code}
        html={breakLines(escapeHtml(code))}
        lang={lang}
        spellCheck={false}
        onChange={(s) => onChange(unescapeHtml(s))}
      />
      <Highlight code={code} language={lang} />
    </pre>
  )
}

function escapeHtml(unsafe) {
  return unsafe.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function breakLines(str) {
  return (
    str
      .split('\n')
      //.map((line) => `<div class="${styles.line}">${line}</div>`)
      .join('<br>')
  )
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
