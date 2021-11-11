import React, { useState } from 'react'
import Kr from 'kram'
import ContentEditable from 'react-contenteditable'
import { Highlight } from './highlight.js'

import styles from './document.css'

Prism.manual = true

export function Editor(props) {
  const { lang, className, wysiwyg, highlight, onChange, onSave } = props
  const [code, setCode] = useState(props.code)
  console.log('Editor:', code, lang)

  const handleChange = (s) => {
    setCode(s)
    onChange(s, lang)
  }

  const handleKey = () => {}

  const handleBlur = onSave

  return wysiwyg ? (
    <ContentEditable
      className={className}
      tagName="section"
      html={code}
      spellCheck={true}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      onKeyPress={handleKey}
    />
  ) : (
    <figure className={className}>
      <pre className={`language-${lang}`}>
        {highlight && <Highlight code={code} language={lang} />}
        <ContentEditable
          className={styles.codeinput}
          tagName="code"
          lang="zxx"
          spellCheck={false}
          html={escapeHtml(code)}
          onChange={(e) => handleChange(unescapeHtml(e.target.value))}
          onBlur={handleBlur}
          onKeyPress={handleKey}
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
