import React from 'react'

export function Document({ content }) {
  return <div dangerouslySetInnerHTML={content} />
}
