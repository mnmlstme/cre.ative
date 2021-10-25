import React from 'react'
import Kr from 'kram'
import Prism from 'prismjs'
import theme from 'prismjs/themes/prism-funky.css'
import ContentEditable from 'react-contenteditable'

import styles from './document.css'

Prism.manual = true

export function Editor({ code, lang, className, onChange, onBlur }) {
  console.log('Editor:', code, lang)

  return (
    <figure className={className}>
      <PrismCode
        code={code}
        language={lang}
        onChange={onChange}
        onBlur={onBlur}
      />
      <figcaption>
        <dl className={styles.specs}>
          <dt>Language</dt>
          <dd>{lang}</dd>
        </dl>
      </figcaption>
    </figure>
  )
}

function PrismCode({ code, plugins, language, onChange, onBlur }) {
  const verbatim = Prism.highlight(code, Prism.languages[language], language)
    .replace(/\<span class="([\sa-z-]+)"\>/g, replacePrismClasses)
    .split('\n')
    .map((line) => `<div class="${styles.line}">${line}</div>`)
    .join('')

  return (
    <pre className={`language-${language}`}>
      <ContentEditable
        className={`language-${language} ${styles.code}`}
        tagName="code"
        html={verbatim}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </pre>
  )
}

function replacePrismClasses(match, className) {
  const classes = className
    .split(/\s+/)
    .map((cls) => theme[cls] || cls)
    .join(' ')

  return match.replace(className, classes)
}
