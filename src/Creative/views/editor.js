import React from 'react'
const he = require('he')
import { Popup } from './popup'

import styles from './editor.css'

export class Editor extends React.Component {
  constructor(props) {
    const { initialContent, onSave } = props

    super(props)

    this.state = {
      content: normalizeHTML(initialContent),
      range: null,
      popup: null,
    }

    this.root = React.createRef()

    this.setContent = (html) => this.setState({ content: html })

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyEvent = this.handleKeyEvent.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleSelectionChange = this.handleSelectionChange.bind(this)
    this.handlePopupSelection = this.handlePopupSelection.bind(this)

    this.keymaps = (props.keymaps || []).concat([coreKeymap])

    let primitives = {
      // the following can be invoked from actions
      getRootNode: () => this.root.current,

      getSelectionRange: () => this.state.range,

      getBlocksInFocus: () => selectedBlocks(this.state.range),

      saveContent: onSave,

      userSelectAction: (options) => this.setState({ popup: { options } }),

      modifyBlockTag: (tag, parentTag, el) => {
        if (el.tagName !== tag) {
          this.saveExcursion(() => {
            const parentEl = el.parentNode

            let replacement = document.createElement(tag)
            el.before(replacement)

            while (el.firstChild) {
              replacement.appendChild(el.firstChild)
            }

            if (parentTag && (!parentEl || parentTag !== parentEl.tagName)) {
              let newParent = document.createElement(parentTag)
              el.before(newParent)
              newParent.appendChild(replacement)
            }

            el.remove()
          })
        }
      },
    }

    this._agent = createAgent(primitives, coreBindings.concat(props.exposing))
  }

  getAgent() {
    return this._agent
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

    updateFocusForRange(range, this.root.current)

    console.log('Save Excursion end', range)

    this.setState({
      content: getHTML(this.root.current),
      range,
    })
  }

  invokeWithCurrentContext(context, action, argsPassed = []) {
    const fn = typeof action === 'function' ? action : action.fn

    return fn.call(context, ...argsPassed)
  }

  invokeWithNewContext(init, action, argsPassed = []) {
    const newContext = this.createContext(init)

    return this.invokeWithCurrentContext(newContext, action, argsPassed)
  }

  createContext(init) {
    const agent = this.getAgent()

    return agent.setContext(init)
  }

  invokeOnEvent(e, action, defaultOn = 'keydown') {
    const { on, fn } =
      typeof action === 'function' ? { on: defaultOn, fn: action } : action

    if (on === e.type) {
      e.preventDefault()
      e.stopPropagation()
      this.invokeWithNewContext({ event: e }, fn)
    }
  }

  handleKeyEvent(e) {
    if (['Shift', 'Meta', 'Alt', 'Control'].includes(e.key)) {
      // ignore modifier keys on their own
      return
    }

    if (this.state.popup) {
      this.handlePopupKeyEvent(e)
    } else {
      const action = lookupKeyEvent(e, this.keymaps)

      if (action) {
        this.invokeOnEvent(e, action, 'keydown')
      }
    }
  }

  handlePopupKeyEvent(e) {
    const code = keyCombo(e)
    const { options } = this.state.popup

    console.log('popup key event', e.type, code)

    switch (e.type) {
      case 'keyup':
        const chosen = options.find((opt) => opt.key === code)

        if (chosen) {
          console.log('User Selected', chosen.name)
          this.setState({ popup: null })
          this.invokeOnEvent(e, chosen.action, 'keyup')
        } else {
          console.log('!!! Invalid key, try again')
          // TODO: beep or flash the popup or something
        }
      default:
        e.preventDefault()
        e.stopPropagation()
    }
  }

  handleChange(e) {
    const { onChange } = this.props
    const html = getHTML(e.target)

    console.log('handleChange', html)
    if (html !== this.state.content) {
      this.setState({ content: html })
      onChange && onChange(html)
    } else {
      debugger
    }
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
    const el = this.root.current
    const range = getSelectionWithin(el)

    updateFocusForRange(range, el)
  }

  handlePopupSelection(opt) {
    this.setState({ popup: null })
    opt && this.invokeWithNewContext({}, opt.action)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { className, tagName } = this.props
    const { content, popup, range } = this.state
    const el = this.root.current
    const html = el ? getHTML(el) : ''

    if (!el) {
      return true
    }

    if (nextState.content !== html) {
      console.log('Content changed, should update', nextState.content, html)
      return true
    }

    if (
      (nextState.range && nextState.range.commonAncestorContainer) !==
      (range && range.commonAncestorContainer)
    ) {
      console.log(
        'Selector range changed, should update',
        nextState.range,
        range
      )
      return true
    }

    if (nextState.popup !== popup) {
      console.log('popup changed, should update')
      return true
    }

    return className !== nextProps.className || tagName !== nextProps.tagName
  }

  render() {
    const { className, tagName, disabled, spellCheck, lang } = this.props
    const { content, popup } = this.state
    const options = popup && popup.options

    return (
      <div className={styles.editor}>
        <Popup
          isOpen={Boolean(options)}
          options={options}
          onSelect={this.handlePopupSelection}
          onClose={() => this.setState({ popup: null })}
        />
        {React.createElement(tagName || 'code', {
          className,
          spellCheck,
          lang: lang || 'zxx',
          contentEditable: !disabled,
          onInput: this.handleChange,
          onKeyDown: this.handleKeyEvent,
          onKeyUp: this.handleKeyEvent,
          onBlur: this.handleBlur,
          ref: this.root,
          dangerouslySetInnerHTML: { __html: content },
        })}
      </div>
    )
  }

  componentDidMount() {
    const el = this.root.current
    this.setState({ content: el.innerHTML })

    document.addEventListener('selectionchange', this.handleSelectionChange)
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.handleSelectionChange)
  }

  componentDidUpdate(prevProps, prevState) {
    const el = this.root.current
    const { content, range } = this.state

    console.log(
      'componentDidUpdate',
      prevProps,
      prevState,
      this.props,
      this.state
    )

    if (content !== getHTML(el)) {
      console.log('DOM got out-of-date', content, 'vs', el)
      el.innerHTML = content
    }

    updateFocusForRange(range, el)
  }
}

function createAgent(primitives, bindings) {
  // primitives are already bound to the editor
  // bindings will be bound to the agent

  let context = {}
  let agent = {
    getContext: () => context,
    setContext: (init) => {
      context = Object.assign({}, init)
      return agent
    },
  }
  const boundEntries = bindings
    .filter((fn) => typeof fn === 'function')
    .map((fn) => [fn.displayName || fn.name, fn.bind(agent)])

  Object.assign(agent, primitives, Object.fromEntries(boundEntries))

  return agent
}

function normalizeHTML(s) {
  return he.decode(s)
}

const cleanRE = new RegExp(`<([a-z1-6]+)\\s+class="${styles.focus}"`)

function getHTML(el) {
  return normalizeHTML(el.innerHTML).replace(cleanRE, '<$1')
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
    el = el.closest('section,div,p,h1,h2,h3,li')
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

function lookupKeyEvent(e, keymaps) {
  const code = keyCombo(e)

  console.log('Key Event:', e.type, code)

  const fname = keymaps.reduce((accum, current) => accum || current[code], null)

  return fname
}

function keyCombo({ key, shiftKey, ctrlKey, altKey, metaKey }) {
  const code = [
    altKey && 'Opt-', // Alt on windows
    metaKey && 'Cmd-', // Windows key on windows
    shiftKey && key.length > 1 && 'S-',
    ctrlKey && '^',
    key,
  ]
    .filter((s) => !!s)
    .join('')

  return code
}

function doNothing() {}

function finished() {
  this.saveContent()
}

const coreKeymap = {
  Tab: doNothing,
  'S-Enter': finished,
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
}

const coreBindings = [doNothing, finished]
