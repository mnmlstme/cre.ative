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
        <li key={i} className={styles.scene}>
          <section
            className={styles.doc}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {views[i] && (
            <figure className={styles.view}>
              <figcaption>
                <dl className={styles.specs}>
                  <dt>Language</dt>
                  <dd>{views[i].lang}</dd>
                </dl>
              </figcaption>
              <pre className={styles.code}>
                {views[i].text.split('\n').map((s) => (
                  <span>{s + '\n'}</span>
                ))}
              </pre>
            </figure>
          )}
        </li>
      ))}
    </ol>
  )
}
