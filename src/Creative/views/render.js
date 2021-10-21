import React from 'react'
import Kr from 'kram'
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
      modules.forEach(({ language, bind }) => {
        const r = resources.get(language)

        if (r.isLoaded) {
          console.log(`Mounting ${language} resource`, r.module)

          bind(r.module, mountpoint, init)
        }
      })
    }
  }
}
