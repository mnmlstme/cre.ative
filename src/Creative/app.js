import React from 'react'
import ReactDOM from 'react-dom'
import { Document } from './document'
import { Render } from './render'

const Workbook = ({ workbook }) => {}

const Finder = ({ setState, loadFile, filename }) => {}

export default function (props) {
  if (props.workbook) {
    const { title, platform, model, html, bind } = props.workbook

    return (
      <article>
        <header>{title}</header>
        <section classname="">
          <Document content={html} />
          <Render bind={bind} model={model} />
        </section>
      </article>
    )
  } else {
    const { filepath, changeFile, loadFile } = props

    return (
      <form>
        <input
          type="text"
          value={filepath}
          onChange={(event) => changeFile(event.target.value)}
        />
        <button onClick={loadFile}>Open</button>
      </form>
    )
  }
}
