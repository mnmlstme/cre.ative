import React from 'react'
import Prism from 'prismjs'
import theme from 'prismjs/themes/prism-funky.css'
import styles from './code.css'

Prism.manual = true

export function Highlight({ code, language }) {
  const verbatim = {
    __html: Prism.highlight(code, Prism.languages[language], language)
      .replace(/\<span class="([\sa-z-]+)"\>/g, replaceThemeClasses)
      .split('\n')
      .map((line) => `<div class="${styles.line}">${line}</div>`)
      .join(''),
  }

  return (
    <code
      className={`language-${language} ${styles.highlight}`}
      dangerouslySetInnerHTML={verbatim}
    />
  )
}

function replaceThemeClasses(match, className) {
  const classes = className
    .split(/\s+/)
    .map((cls) => theme[cls] || cls)
    .join(' ')

  return match.replace(className, classes)
}
