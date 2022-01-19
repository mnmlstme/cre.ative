import React from 'react'
import styles from './code.css'

export function Highlight({ code, language }) {
  return (
    <code
      className={`language-${language} ${styles.code}`}
      dangerouslySetInnerHTML={verbatim}
    />
  )
}
