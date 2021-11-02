import React, { useState } from 'react'
import Kr from 'kram'
import ContentEditable from 'react-contenteditable'
import { Highlight } from './highlight.js'

import styles from './document.css'

Prism.manual = true

export function Editor(props) {
  const { lang, className, onChange } = props
  const [code, setCode] = useState(props.code)
  console.log('Editor:', code, lang)

  const handleBlur = () => onChange(code, lang)

  return (
    <figure className={className}>
      <pre className={`language-${lang}`}>
        <Highlight code={code} language={lang} />
        <ContentEditable
          className={styles.codeinput}
          tagName="code"
          html={escapeHtml(code)}
          lang="zxx"
          spellcheck="false"
          onChange={(e) => setCode(unescapeHtml(e.target.value))}
          onBlur={handleBlur}
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
  return unsafe.replace(/</g, '&lt;')
}

function unescapeHtml(safe) {
  return safe.replace(/&lt;/g, '<')
}
