import React from 'react'
const he = require('he')
import { Popup } from './popup'
import { agentFactory, delegateKeyEvent, delegateUserAction } from './agent'

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

    // console.log('handleChange\n--html--\n', html, '--text--\n', text)
    onChange && onChange(html, text)
  }

  shouldComponentUpdate(nextProps) {
    const { className, tagName, html } = nextProps
    const el = this.root.current

    if (!el) {
      return true
    }

    if (html !== getHTML(el)) {
      // console.log('Content changed externally, should update', html)
      return true
    } else
      return (
        className !== this.props.className || tagName !== this.props.tagName
      )
  }

  render() {
    const {
      className,
      tagName,
      html,
      spellCheck,
      lang,
      mode,
      markBefore,
      disabled,
    } = this.props

    return React.createElement(
      tagName || 'div',
      Object.assign(
        {
          className,
          spellCheck,
          'data-mode-name': mode || 'core',
          lang: lang || 'zxx',
          contentEditable: !disabled,
        },
        markBefore && markBefore !== ''
          ? { 'data-mark-before': markBefore }
          : {},
        {
          onInput: this.handleChange,
          ref: this.root,
          dangerouslySetInnerHTML: { __html: html },
        }
      )
    )
  }
}

export class Editor extends React.Component {
  constructor(props) {
    const { onSave } = props

    super(props)

    this.root = React.createRef()
    this._range = null

    this.state = {
      popup: null,
    }

    let primitives = {
      // the following can be invoked through agent, while
      // maintaining access to Editor's member functions
      forward_chars: this.forwardChars.bind(this),
      backward_chars: this.backwardChars.bind(this),
      insert_chars: this.insertChars.bind(this),
      forward_select_chars: this.forwardSelectChars.bind(this),
      backward_select_chars: this.backwardSelectChars.bind(this),
      surround_selection: this.surroundSelection.bind(this),
      insert_markup: this.insertMarkup.bind(this),
      delete_selection: this.deleteSelection.bind(this),
      selection_is_empty: this.selectionIsEmpty.bind(this),
      save_content: () => onSave && onSave(),
      save_excursion: this.saveExcursion.bind(this),

      // promptWithOptions: this.promptWithOptions.bind(this),
      // cancelPrompt: this.cancelPrompt.bind(this),
    }

    this._factory = agentFactory(primitives, coreMode, props.modes)

    this.handleKeyEvent = (e) => {
      const modeName = e.target.dataset.modeName
      delegateKeyEvent(this.getAgent(modeName), e)
    }
    this.handleBlur = this.handleBlur.bind(this)
    this.handleSelectionChange = this.handleSelectionChange.bind(this)
    // this.handlePopupSelection = this.handlePopupSelection.bind(this)
  }

  getAgent(modeName) {
    return this._factory(modeName)
  }

  getCaretPos() {
    const { endContainer, endOffset } = this._range

    return { node: endContainer, offset: endOffset }
  }

  getAnchorPos() {
    const { startContainer, startOffset } = this._range

    return { node: startContainer, offset: startOffset }
  }

  getSelectionStartAndEnd() {
    const { startContainer, startOffset, endContainer, endOffset } = this._range

    return [
      { node: startContainer, offset: startOffset },
      { node: endContainer, offset: endOffset },
    ]
  }

  getActiveBlock(pos) {
    let { node } = pos || this.getCaretPos()

    while (node && node.nodeType !== 1 /* ELEMENT_NODE */) {
      node = node.parentNode
    }

    return node.closest('[contenteditable]')
  }

  getPositionInBlock(pos) {
    const { node, offset } = pos
    const root = getActiveBlock(pos)

    return offset + countCharsBefore(node, root)
  }

  setCaret(pos) {
    this.setSelection(pos, pos)
  }

  setAnchor(pos) {
    this.setSelection(pos)
  }

  setSelection(anchor, caret) {
    let range = this._range

    if (caret) {
      range.setStart(anchor.node, anchor.offset)
      range.setEnd(caret.node, caret.offset)
    } else if (
      getPositionInBlock(anchor) > getPositionInBlock(this.getCaretPos())
    ) {
      range.setEnd(anchor.node, anchor.offset)
    } else {
      range.setStart(anchor.node, anchor.offset)
    }
  }

  selectionIsEmpty() {
    return this._range.collapsed
  }

  forwardChars(n = 1) {
    const root = this.getActiveBlock()

    this.setCaret(advancePosition(n, this.getCaretPos(), root))
  }

  backwardChars(n = 1) {
    const root = this.getActiveBlock()

    this.setCaret(retreatPosition(n, this.getCaretPos(), root))
  }

  forwardSelectChars(n = 1) {
    const root = this.getActiveBlock()

    this.setSelection(
      this.getAnchorPos(),
      advancePosition(n, this.getCaretPos(), root)
    )
  }

  backwardSelectChars(n = 1) {
    const root = this.getActiveBlock()

    this.setSelection(
      retreatPosition(n, this.getAnchorPos(), root),
      this.getCaretPos()
    )
  }

  insertChars(s) {
    const { node, offset } = this.getCaretPos()

    switch (node.nodeType) {
      case Node.TEXT_NODE:
      case Node.CDATA_SECTION_NODE:
      case Node.COMMENT_NODE:
        node.insertData(offset, s)
        this.forwardChars(s.length)
        return true
      default:
        const ref = node.childNodes.item(offset)
        const text = document.createTextNode(s)
        node.insertBefore(text, ref)
        return true
    }
  }

  deleteSelection() {
    this._range && this._range.deleteContents()
  }

  surroundSelection(tag, mark) {
    const markup = document.createElement(tag)

    mark && markup.setAttribute('data-mark-around', mark)
    this._range.surroundContents(markup)
  }

  insertMarkup(tag, mark) {
    const markup = document.createElement(tag)
    const inside = document.createTextNode('')

    mark && markup.setAttribute('data-mark-around', mark)
    markup.append(inside)
    this._range.insertNode(markup)

    this.setCaret({ node: inside, offset: 0 })
  }

  saveExcursion(thunk) {
    // run the function (usually to side-effect the DOM)
    // and then clean up the state to get the user back

    let selection = document.getSelection()
    let range = this._range

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
  /*
  promptWithOptions(options) {
    this.getAgent().setContext({ options })
    this.setState({ popup: { options } })
  }

  cancelPrompt() {
    this.setState({ popup: null })
    this.getAgent().clearContext('options')
  }
*/
  handleSelectionChange(e) {
    const el = this.root.current
    const newRange = getSelectionWithin(el)

    if (newRange) {
      this._range = newRange
    }
  }

  handleBlur(e) {
    // const el = this.root.current
    // const range = getSelectionWithin(el)
    //
    // updateFocusForRange(range, el)
  }

  /*
  handlePopupSelection(opt) {
    this.closePrompt()
    opt && delegateUserAction(this.getAgent(), opt.action)
  }
*/
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

function countCharsIn(node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
    case Node.CDATA_SECTION_NODE:
    case Node.COMMENT_NODE:
      return node.nodeValue.length
    case Node.ELEMENT_NODE:
      return Array.from(node.childNodes)
        .map(countCharsIn)
        .reduce((a, b) => a + b)
    default:
      return 0
  }
}

function countCharsBefore(node, rootEl) {
  if (node === rootEl) {
    return 0
  } else {
    const prev = node.previousSibling || node.parentNode
    return countCharsIn(prev) + countCharsBefore(prev, rootEl)
  }
}

function advancePosition(n, pos, rootEl) {
  const { node, offset } = pos

  switch (node.nodeType) {
    case Node.TEXT_NODE:
    case Node.CDATA_SECTION_NODE:
    case Node.COMMENT_NODE:
      const available = node.nodeValue.length - offset
      return n <= available
        ? { node, offset: offset + n }
        : advancePosition(
            n - available,
            {
              node: node.nextSibling || node.parentNode,
              offset: 0,
            },
            rootEl
          )

    case Node.ELEMENT_NODE:
      return node === rootEl
        ? pos
        : advancePosition(
            n,
            {
              node: node.nextSibling || node.parentNode,
              offset: 0,
            },
            rootEl
          )
    default:
      return pos
  }
}

function retreatPosition(n, pos, rootEl) {
  const { node, offset } = pos

  switch (node.nodeType) {
    case Node.TEXT_NODE:
    case Node.CDATA_SECTION_NODE:
    case Node.COMMENT_NODE:
      const available = offset > 0 ? offset : node.nodeValue.length + offset + 1
      return n <= available
        ? { node, offset: available - n }
        : retreatPosition(
            n - available,
            {
              node: node.previousSibling || node.parentNode,
              offset: -1,
            },
            rootEl
          )

    case Node.ELEMENT_NODE:
      return node === rootEl
        ? pos
        : advancePosition(
            n,
            {
              node: node.previousSibling || node.parentNode,
              offset: -1,
            },
            rootEl
          )
    default:
      return pos
  }
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

function closestBlock(el, root) {
  if (el) {
    el = el.closest('section,div,p,h1,h2,h3,li,pre')
  }

  return el === root ? null : el
}

function do_nothing() {}

function finished() {
  this.save_content()
}

const coreMode = {
  name: 'core',
  description: 'base mode inherited by all other modes',
  keymaps: [
    {
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
      Tab: do_nothing,
      'S-Enter': finished,
    },
  ],
  bindings: [do_nothing, finished],
}
