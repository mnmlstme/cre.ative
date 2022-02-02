import React from 'react'

import styles from './popup.css'

export class Popup extends React.Component {
  constructor(props) {
    super(props)

    this.root = React.createRef()
    this.state = {
      fromLeft: 0,
      fromTop: 0,
      fromBottom: 0,
      fromRight: 0,
    }
  }

  render() {
    const { isOpen, options, onSelect } = this.props
    const { fromLeft, fromBottom } = this.state
    const classes = [styles.popup].concat(isOpen ? [styles['is-open']] : [])

    const Item = (opt) => (
      <li key={opt.key}>
        <button
          className={styles.action}
          data-tip={opt.description}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelect(opt)
          }}
        >
          <span className={styles.label}>{opt.label || '?'}</span>
          <span className={styles.key}>{opt.key}</span>
        </button>
      </li>
    )

    return (
      <ul
        className={classes.join(' ')}
        style={{ left: fromLeft, bottom: fromBottom }}
        ref={this.root}
      >
        {options && options.map(Item)}
      </ul>
    )
  }

  componentDidMoint() {
    this.componentDidUpdate()
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      const el = this.root.current
      const container = el.offsetParent
      const point = getCaretCoordinates()
      const rect = container.getClientRects()[0]

      this.setState({
        fromLeft: `${point.x - rect.left}px`,
        fromTop: `${point.y - rect.top}px`,
        fromRight: `${rect.right - point.x}px`,
        fromBottom: `${rect.bottom - point.y}px`,
      })
    }
  }
}

function getCaretCoordinates() {
  let x, y
  const isSupported = typeof window.getSelection !== 'undefined'
  if (isSupported) {
    const selection = window.getSelection()
    // Check if there is a selection (i.e. cursor in place)
    if (selection.rangeCount !== 0) {
      // Clone the range
      const range = selection.getRangeAt(0).cloneRange()
      // Collapse the range to the start, so there are not multiple chars selected
      range.collapse(false)
      // getCientRects returns all the positioning information we need
      const rect = range.getClientRects()[0]
      if (rect) {
        x = rect.left
        y = rect.top
      }
    }
  }
  return { x, y }
}
