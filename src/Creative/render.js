import React from 'react'

export class Render extends React.Component {
  constructor(props) {
    super(props)
    this.node = React.createRef()
  }

  render() {
    return <div ref={this.node} />
  }

  componentDidMount() {
    const { model, bind } = this.props
    bind(this.node.current, model)
  }
}
