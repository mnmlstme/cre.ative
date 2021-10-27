import React, { useState } from 'react'
import Kr from 'kram'
import Prism from 'prismjs'
import theme from 'prismjs/themes/prism-funky.css'
import ContentEditable from 'react-contenteditable'

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
        <PrismCode code={code} language={lang} />
        <textarea
          className={styles.codeinput}
          value={code}
          onChange={(e) => setCode(e.target.value)}
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

function PrismCode({ code, plugins, language }) {
  const verbatim = {
    __html: Prism.highlight(code, Prism.languages[language], language)
      .replace(/\<span class="([\sa-z-]+)"\>/g, replacePrismClasses)
      .split('\n')
      .map((line) => `<div class="${styles.line}">${line}</div>`)
      .join(''),
  }

  return (
    <code
      className={`language-${language} ${styles.code}`}
      dangerouslySetInnerHTML={verbatim}
    />
  )
}

function replacePrismClasses(match, className) {
  const classes = className
    .split(/\s+/)
    .map((cls) => theme[cls] || cls)
    .join(' ')

  return match.replace(className, classes)
}
