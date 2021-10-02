import React from 'react'
import Kr from 'kram'
import styles from './workbook.css'

export function Document({ workbook }) {
  console.log('Document:', workbook)
  const docs = Kr.format(workbook)
  const views = Kr.extract(workbook)

  return (
    <ol>
      {docs.map((html, i) => (
        <li key={i}>
          <section
            className={styles.doc}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <pre className={styles.code}>{views[i].text}</pre>
        </li>
      ))}
    </ol>
  )
}
