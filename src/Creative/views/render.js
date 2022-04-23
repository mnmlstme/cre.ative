import React from 'react'
import Kr from '@cre.ative/kram'
const path = require('path')
import styles from './workbook.css'

export class Render extends React.Component {
  constructor(props) {
    super(props)
    this.node = React.createRef()
  }

  render() {
    return <div className={styles.container} ref={this.node} />
  }

  componentDidMount() {
    const { workbook, doLoadResource } = this.props
    const modules = workbook.get('modules')

    console.log('Rendering Workbook', workbook)

    modules.forEach(({ language, load }) => doLoadResource(load, language))
  }

  componentDidUpdate(prevProps) {
    const { workbook, resources } = this.props
    const modules = workbook.get('modules')
    const init = workbook.get('init')
    const mountpoint = this.node.current

    if (resources !== prevProps.resources) {
      const loadedSoFar = resources
        .filterNot((k, r) => r.isLoaded)
        .map((r) => r.module)

      console.log('Resources loaded:', loadedSoFar.toObject())

      modules
        .filter((m) => m.bind && loadedSoFar.has(m.language))
        .forEach(({ language, bind }) => {
          const r = loadedSoFar.get(language)
          const dict = loadedSoFar.delete(language).toObject()

          console.log('Binding resource: ', language, r, dict)
          bind(r, mountpoint, init, dict)
        })
    }
  }
}
