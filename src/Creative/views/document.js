import React from 'react'
import Kr from 'kram'

export function Document({ workbook }) {
  console.log('Document:', workbook)
  const scenes = Kr.format(workbook)

  return (
    <ol>
      {scenes.map((html) => (
        <li dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </ol>
  )
}
