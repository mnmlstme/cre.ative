import React from 'react'
import { Editor, coreKeymap } from './editor.js'
import { Highlight } from './highlight.js'

import styles from './code.css'

Prism.manual = true

export class CodeEditor extends React.Component {
  constructor(props) {
    const { lang, content } = props
    super(props)

    this.state = {
      transient: content,
    }

    this.handleChange = this.handleChange.bind(this)
    this.keymaps = [languages[lang] || {}, codeKeymap]
  }

  handleChange(html) {
    const { onChange } = this.props
    const s = unescapeHtml(html)
    this.setState({ transient: s })
    onChange && onChange(s, this.props.lang)
  }

  render() {
    const { mode, lang, content, onChange, onSave } = this.props
    const { transient } = this.state

    console.log('CodeEditor render...')

    return (
      <figure className={styles[mode]}>
        <pre className={`language-${lang}`}>
          <Highlight code={transient} language={lang} />
          <Editor
            className={styles.code}
            tagName="code"
            spellCheck={false}
            lang={lang}
            keymaps={this.keymaps}
            initialContent={escapeHtml(content)}
            onChange={this.handleChange}
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
