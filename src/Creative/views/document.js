import React from 'react'
import Kr from 'kram'

export function Document({ workbook }) {
  console.log('Document:', workbook)
  const docs = Kr.format(workbook)
  const views = Kr.extract(workbook)

  return (
    <ol>
      {docs.map((html, i) => (
        <li key={i}>
          <section dangerouslySetInnerHTML={{ __html: html }} />
          <pre>{views[i].text}</pre>
        </li>
      ))}
    </ol>
  )
}
