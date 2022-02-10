import React from 'react'
import { Editor, Block, coreKeymap } from './editor.js'
import { Highlight } from './highlight.js'

import styles from './code.css'

export function CodeEditor(props) {
  const { block, onChange, onSave } = props
  const { mode, lang, text } = block
  const keymaps = [languages[lang] || {}, codeKeymap]

  console.log('CodeEditor render...')

  return (
    <Editor
      className={styles[mode]}
      keymaps={keymaps}
      provides={{}}
      onChange={onChange}
      onSave={onSave}
    >
      <CodeBlock code={text} lang={lang} />
      <footer>
        <dl className={styles.specs}>
          <dt>Language</dt>
          <dd>{lang}</dd>
        </dl>
      </footer>
    </Editor>
  )
}

export function CodeBlock({ code, lang }) {
  return (
    <pre className={`language-${lang}`}>
      <Block
        tagName="code"
        className={styles.code}
        html={escapeHtml(code)}
        lang={lang}
        spellCheck={false}
      />
      <Highlight code={code} language={lang} />
    </pre>
  )
}

export function escapeHtml(unsafe) {
  return unsafe.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function unescapeHtml(safe) {
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
