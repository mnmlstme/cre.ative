import React from 'react'
import Kr from 'kram'
import styles from './workbook.css'

export function Editor({ code, lang }) {
  console.log('Editor:', code, lang)

  return (
    <figure className={styles.view}>
      <pre className={styles.code}>
        {code.split('\n').map((s, line) => (
          <span key={line}>{s + '\n'}</span>
        ))}
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
