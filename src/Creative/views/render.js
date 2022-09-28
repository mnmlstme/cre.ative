import React from 'react'
const path = require('path')
import styles from './workbook.css'

export class Render extends React.Component {
  constructor(props) {
    super(props)
    this.scenes = React.createRef()
    this.resources = React.createRef()
    this.renderFn = {}
    this.rendered = []
  }

  render() {
    const { workbook } = this.props
    const scenes = workbook.get('scenes')

    return (
      <div className={styles.container}>
        <ol ref={this.scenes}>
          {scenes.map(() => (
            <li />
          ))}
        </ol>
        <div ref={this.resources} />
      </div>
    )
  }

  componentDidMount() {
    const { workbook, scene, doLoadResource } = this.props
    const modules = workbook.get('modules')

    console.log('Rendering Workbook', workbook, scene)

    modules.forEach(doLoadResource)
  }

  componentDidUpdate(prevProps) {
    const { scene, workbook, resources } = this.props
    const modules = workbook.get('modules')
    const init = workbook.get('init')
    const mountpoint = this.resources.current

    if (resources !== prevProps.resources) {
      const readyToBind = resources
        .filter((r) => r.isLoaded)
        .filterNot((_, k) => this.renderFn[k])
        .map((r) => r.module)

      console.log('Resources bound:', this.bound)
      console.log('Resources ready-to-bind:', readyToBind.toObject())

      modules
        .filter((m) => m.bind && readyToBind.has(m.language))
        .forEach(({ language, bind }) => {
          const r = readyToBind.get(language)

          console.log('Binding resource: ', language, r)
          this.renderFn[language] = bind(r, mountpoint, init)
        })
    }

    if (scene && !this.rendered[scene - 1]) {
      const mountpoint = this.scenes.current
      const container = mountpoint.children[scene - 1]
      const scenes = workbook.get('scenes')
      const blocks = scenes.get(scene - 1).get('blocks')
      const performance = blocks.filter((b) => {
        const type = b.get(0)
        const mode = b.get(1)['mode']

        return type === 'fence' && mode === 'eval'
      })

      if (performance.size) {
        const evalblk = performance.get(0)
        const lang = evalblk.get(1)['lang']
        const render = this.renderFn[lang]

        if (render) {
          console.log('Rendering scene:', scene, lang, container)

          render(scene, container)
          this.rendered[scene - 1] = container
        }
      }
    }
  }
}
