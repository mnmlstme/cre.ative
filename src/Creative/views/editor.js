import React from 'react'
import Kr from 'kram'
import Prism from 'prismjs'
import theme from 'prismjs/themes/prism-funky.css'

import styles from './workbook.css'

Prism.manual = true

export function Editor({ code, lang, className }) {
  console.log('Editor:', code, lang)

  return (
    <figure className={className}>
      <PrismCode code={code} language={lang} />
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
      .map((line) => `<span class="${styles.line}">${line}</span>`)
      .join('\n'),
  }

  return (
    <pre className={`language-${language}`}>
      <code
        className={`language-${language} ${styles.code}`}
        dangerouslySetInnerHTML={verbatim}
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
