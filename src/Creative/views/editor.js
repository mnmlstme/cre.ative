import React from 'react'
const he = require('he')
import { Popup } from './popup'
import { createAgent, delegateKeyEvent, delegateUserAction } from './agent'

import styles from './editor.css'

export class Block extends React.Component {
  constructor(props) {
    super(props)

    const { html } = props

    this.root = React.createRef()
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    const { onChange } = this.props
    const html = getHTML(e.target)
    const text = getText(e.target)

    console.log('handleChange\n--html--\n', html, '--text--\n', text)
    onChange && onChange(html, text)
  }

  shouldComponentUpdate(nextProps) {
    const { className, tagName, html } = nextProps
    const el = this.root.current

    if (!el) {
      return true
    }

    if (html !== getHTML(el)) {
      console.log('Content changed externally, should update', html)
      return true
    } else
      return (
        className !== this.props.className || tagName !== this.props.tagName
      )
  }

  render() {
    const { className, tagName, html, spellCheck, lang, disabled } = this.props

    console.log(`Block render <${tagName || 'div'}>`, html)

    return React.createElement(tagName || 'div', {
      className,
      spellCheck,
      lang: lang || 'zxx',
      contentEditable: !disabled,
      onInput: this.handleChange,
      ref: this.root,
      dangerouslySetInnerHTML: { __html: html },
    })
  }
}

export class Editor extends React.Component {
  constructor(props) {
    const { onSave } = props

    super(props)

    this.root = React.createRef()

    this.state = {
      range: null,
      popup: null,
    }

    let primitives = {
      // the following can be invoked from actions
      // getRootNode: () => this.root.current,

      getSelectionRange: () => this.state.range,

      getBlocksInFocus: () => selectedBlocks(this.state.range),

      saveContent: () => onSave && onSave(),

      promptWithOptions: this.promptWithOptions.bind(this),
      cancelPrompt: this.cancelPrompt.bind(this),

      saveExcursion: this.saveExcursion.bind(this),
    }

    let agent = createAgent(
      primitives,
      coreBindings.concat(props.provides),
      (props.keymaps || []).concat([coreKeymap])
    )

    this.getAgent = () => agent

    this.handleKeyEvent = (e) => delegateKeyEvent(agent, e)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleSelectionChange = this.handleSelectionChange.bind(this)
    this.handlePopupSelection = this.handlePopupSelection.bind(this)
  }

  promptWithOptions(options) {
    this.getAgent().setContext({ options })
    this.setState({ popup: { options } })
  }

  cancelPrompt() {
    this.setState({ popup: null })
    this.getAgent().clearContext('options')
  }

  saveExcursion(thunk) {
    // run the function (usually to side-effect the DOM)
    // and then clean up the state to get the user back

    let selection = document.getSelection()
    let range = this.state.range

    let frozen = document.createElement('i')
    range.surroundContents(frozen)

    if (selection.rangeCount > 0) {
      selection.removeAllRanges()
    }

    console.log('Save Excursion start', range)

    thunk.call(null)

    if (selection.rangeCount > 0) {
      selection.removeAllRanges()
    }

    range.selectNode(frozen)
    selection.addRange(range)

    while (frozen.firstChild) {
      frozen.before(frozen.firstChild)
    }

    frozen.remove()

    // updateFocusForRange(range, this.root.current)

    console.log('Save Excursion end', range)

    this.setState({
      // content: getHTML(this.root.current),
      range,
    })
  }

  handleSelectionChange(e) {
    const el = this.root.current
    const { range } = this.state
    const newRange = getSelectionWithin(el)

    if (newRange && newRange !== range) {
      console.log('Selection changed!', newRange)

      this.setState({
        range: newRange,
      })
    }
  }

  handleBlur(e) {
    // const el = this.root.current
    // const range = getSelectionWithin(el)
    //
    // updateFocusForRange(range, el)
  }

  handlePopupSelection(opt) {
    this.closePrompt()
    opt && delegateUserAction(this.getAgent(), opt.action)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { popup, range } = this.state

    if (
      (nextState.range && nextState.range.commonAncestorContainer) !==
      (range && range.commonAncestorContainer)
    ) {
      // console.log(
      //   'Selector range changed, should update',
      //   nextState.range,
      //   range
      // )
      // return true
    }

    if (nextState.popup !== popup) {
      console.log('popup changed, should update')
      return true
    }

    return true
  }

  render() {
    const { className, children } = this.props
    const { popup } = this.state
    const options = popup && popup.options
    const classes = [styles.editor].concat(className ? [className] : [])

    return (
      <section
        className={classes.join(' ')}
        onKeyDown={this.handleKeyEvent}
        onKeyUp={this.handleKeyEvent}
        ref={this.root}
      >
        {children}
        <Popup
          isOpen={Boolean(options)}
          options={options}
          onSelect={this.handlePopupSelection}
          onClose={() => this.setState({ popup: null })}
        />
      </section>
    )
  }

  componentDidMount() {
    document.addEventListener('selectionchange', this.handleSelectionChange)
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.handleSelectionChange)
  }

  componentDidUpdate(prevProps, prevState) {}
}

function getHTML(el) {
  return el.innerHTML
}

function getText(el) {
  return el.innerText
}

function getSelectionWithin(el) {
  const selection = document.getSelection()
  const range = selection.rangeCount > 0 && selection.getRangeAt(0)
  return range && range.intersectsNode(el) && range
}

function updateFocusForRange(range, el) {
  const focus = selectedBlocks(range, el)
  const noLongerFocused = Array.prototype.filter.call(
    el.getElementsByClassName(styles.focus),
    (n) => !focus.includes(n)
  )

  focus.forEach((n) => n.classList.add(styles.focus))

  Array.prototype.forEach.call(noLongerFocused, (n) =>
    n.classList.remove(styles.focus)
  )
}

function closestBlock(el, root) {
  while (el && el.nodeType !== 1 /* ELEMENT_NODE */) {
    el = el.parentNode
  }

  if (el) {
    el = el.closest('section,div,p,h1,h2,h3,li,pre')
  }

  return el === root ? null : el
}

function selectedBlocks(range, root) {
  if (!range) {
    return []
  }

  let blocks = [
    closestBlock(range.startContainer),
    closestBlock(range.endContainer),
  ].filter((n) => !!n && n !== root)

  if (
    blocks.length > 1 &&
    blocks[1] !== blocks[0].nextSibling &&
    blocks[0] !== blocks[1].nextSibling
  ) {
    if (blocks[0] === blocks[1]) {
      blocks = blocks.slice(1)
    } else {
      // insert all elements in between
    }
  }

  console.log('Selected Blocks:', blocks)
  return blocks
}

function sameBlocks(a, b) {
  return a.length === b.length && a.every((n, i) => b[i] === n)
}

function doNothing() {}

function finished() {
  this.saveContent()
}

const coreKeymap = {
  // Most (all?) browsers have good defaults for the following.
  // We list them here to reserve them.
  ArrowUp: null,
  ArrowDown: null,
  ArrowRight: null,
  ArrowLeft: null,
  Backspace: null,
  'Cmd-x': null,
  'Cmd-v': null,
  'Cmd-c': null,
  'Cmd-z': null,
  '^n': null, // next line
  '^p': null, // previous line
  '^k': null, // kill line
  '^f': null, // forward character
  '^b': null, // backward character
  '^d': null, // delete character
  '^a': null, // beginning of line
  '^e': null, // end of line
  '^v': null, // page down
  Tab: doNothing,
  'S-Enter': finished,
}

const coreBindings = [doNothing, finished]
