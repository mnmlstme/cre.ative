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
      popup: null,
    }

    this.root = React.createRef()

    this.setContent = (html) => this.setState({ content: html })

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyEvent = this.handleKeyEvent.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleSelectionChange = this.handleSelectionChange.bind(this)

    this.keymaps = (props.keymaps || []).concat([coreKeymap])

    const primitiveBindings = {
      // the following can be invoked from actions
      'get-root-node': () => this.root.current,

      'get-selection': () => document.getSelection(),

      'save-content': onSave,

      'user-select-action': (_, options) =>
        this.setState({
          popup: {
            options,
            keymap: Object.fromEntries(options.map((o) => [o.key, o.action])),
          },
        }),
    }

    this.bound = (props.bindings || [])
      .concat([coreBindings])
      .reverse()
      .reduce(
        (bound, bindings) => Object.assign({}, bound, bindings),
        primitiveBindings
      )
  }

  invokeWithCurrentContext(context, action, argsPassed = []) {
    const fn = typeof action === 'function' ? action : action.fn

    return fn.call(null, context, argsPassed)
  }

  invokeWithNewContext(init, action, argsPassed = []) {
    const newContext = this.createContext(init)

    return this.invokeWithCurrentContext(newContext, action, argsPassed)
  }

  createContext(init = {}) {
    const invoke = (fname, ...args) => {
      const newContext = this.createContext(init)

      return this.invokeWithCurrentContext(newContext, this.bound[fname], args)
    }

    return Object.assign({ invoke }, init)
  }

  invokeOnEvent(e, action) {}

  handleKeyEvent(e) {
    if (['Shift', 'Meta', 'Alt', 'Control'].includes(e.key)) {
      // ignore modifier keys
      return
    }

    const keymaps = this.popup
      ? [this.popup.keymap].concat(this.keymaps)
      : this.keymaps
    const fname = lookupKeyEvent(e, keymaps)
    const action = this.bound[fname]

    if (action) {
      const { on, fn } =
        typeof action === 'function' ? { on: 'keydown', fn: action } : action

      if (on === e.type) {
        e.preventDefault()
        e.stopPropagation()
        this.invokeWithNewContext({ event: e }, fn)
      }
    }
  }

  handleChange(e) {
    const { onChange } = this.props
    const html = normalizeHTML(e.target.innerHTML)

    console.log('handleChange', html)
    if (html !== this.state.content) {
      this.setContent(html)
      onChange && onChange(html)
    } else {
      debugger
    }
  }

  handleSelectionChange(e) {
    const range = e.target.getSelection().getRangeAt(0)
    console.log('SelectionChange', range)
  }

  handleBlur(e) {
    const selection = document.getSelection()
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { className, tagName } = this.props
    const { content, popup } = this.state
    const el = this.root.current

    if (!el) {
      return true
    }

    if (nextState.content !== normalizeHTML(el.innerHTML)) {
      console.log('Content Updated', content, el.innerHTML)
      return true
    }

    if (popup !== nextState.popup) {
      console.log('popup changed')
      return true
    }

    return className !== nextProps.className || tagName !== nextProps.tagName
  }

  render() {
    const { className, tagName, disabled, spellCheck, lang } = this.props
    const { content, popup } = this.state

    return (
      <div className={styles.editor}>
        <Popup options={popup && popup.options} />
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
    this.setContent(el.innerHTML)

    document.addEventListener('selectionchange', this.handleSelectionChange)
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.handleSelectionChange)
  }

  componentDidUpdate(prevProps, prevState) {
    const el = this.root.current
    const { content } = this.state

    console.log(
      'componentDidUpdate',
      this.props,
      prevProps,
      this.state,
      prevState
    )

    if (content !== el.innerHTML) {
      el.innerHTML = content
    }
  }
}

function normalizeHTML(s) {
  return he.decode(s)
}

function lookupKeyEvent(
  { key, type, shiftKey, ctrlKey, altKey, metaKey },
  keymaps
) {
  const code = [
    altKey && 'Opt-', // Alt on windows
    metaKey && 'Cmd-', // Windows key on windows
    shiftKey && 'S-',
    ctrlKey && '^',
    key,
  ]
    .filter((s) => !!s)
    .join('')

  console.log('Key Event:', type, code)

  const fname = keymaps.reduce((accum, current) => accum || current[code], null)

  return fname
}

const coreKeymap = {
  Tab: 'do_nothing',
  'S-Enter': 'finished',
  // Most (all?) browsers have good defaults for the following.
  // We list them here so we don't accidentally override them.
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

function coreBindings({ invoke }) {
  return {
    'do-nothing': () => null,
    finished: ({ invoke }) => invoke('save-content'),
  }
}
