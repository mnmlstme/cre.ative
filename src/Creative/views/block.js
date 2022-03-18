import React from 'react'
import he from 'he'

export class Block extends React.Component {
  constructor(props) {
    super(props)

    this.root = React.createRef()
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    const children = e.target.childNodes
    const { block, onChange } = this.props
    const [type, attrs, ...rest] = block

    onChange && onChange([type, attrs].concat(nodesToTokens(children)))
  }

  shouldComponentUpdate(nextProps) {
    const { className, block, disabled } = nextProps
    const [type, attrs, ...rest] = block
    const { tag, markup, lang } = attrs
    const el = this.root.current
    const inner = jsonToHtml(rest)

    if (!el) {
      return true
    }

    if (inner !== el.innerHTML) {
      console.log('Content changed from outside, must update', inner)
      return true
    } else {
      return (
        className !== this.props.className ||
        disabled !== this.props.disabled ||
        tag !== this.props.block[1].tag ||
        markup !== this.props.block[1].markup ||
        lang !== this.props.block[1].lang
      )
    }
  }

  render() {
    const { className, block, mode, disabled } = this.props
    const [type, attrs, ...rest] = block
    const { tag, markup, lang } = attrs
    const spellCheck = type !== 'fence'
    const inner = jsonToHtml(rest)

    return React.createElement(
      tag || 'div',
      Object.assign(
        {
          className,
          spellCheck,
          'data-mode-name': mode || 'core',
          lang: lang || 'zxx',
          contentEditable: !disabled,
        },
        markup && markup !== '' ? { 'data-mark-before': markup } : {},
        {
          onInput: this.handleChange,
          ref: this.root,
          dangerouslySetInnerHTML: { __html: inner },
        }
      )
    )
  }
}

function jsonToHtml(tokens) {
  return tokens
    .map((t) => (typeof t === 'string' ? escapeHtml(t) : tokenToHtml(t)))
    .join('')
}

function tokenToHtml([type, attrs, ...children]) {
  const { tag, block, markup, href } = attrs
  const hrefPair = href && ['href', href]
  const markPair = markup &&
    !type.match(/\w+_list/) &&
    markup != '' && [`data-mark-${block ? 'before' : 'around'}`, markup]
  const htmlAttrs = [markPair, hrefPair]
    .filter(Boolean)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('')

  return children
    ? `<${tag}${htmlAttrs}>${jsonToHtml(children)}</${tag}>`
    : `<${tag}${htmlAttrs}/>`
}

function escapeHtml(unsafe) {
  return unsafe.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function nodesToTokens(children) {
  return Array.prototype.map.call(children, (node) => {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        const block = isBlock(node)
        const attrEntries = [
          ['tag', node.tagName && node.tagName.toLowerCase()],
          ['block', block],
          ['markup', block ? node.dataset.markBefore : node.dataset.markAround],
          ['lang', node.getAttribute('lang')],
          ['href', node.getAttribute('href')],
        ].filter((pair) => typeof pair[1] === 'string' && pair[1] !== '')
        const rest = node.hasChildNodes() ? nodesToTokens(node.childNodes) : []

        return [tokenType(node), Object.fromEntries(attrEntries)].concat(rest)

      case Node.TEXT_NODE:

      default:
        return he.encode(node.nodeValue, {
          useNamedReferences: true,
        })
    }
  })
}

function isBlock(node) {
  const tag = node.tagName

  if (!tag) {
    return false
  }

  if (tag.toLowerCase === 'code') {
    const parent = node.parentNode

    return parent.tagName && parent.tagName.toLowerCase() === 'pre'
  }

  return tag.match(/^(p|h1|h2|h3|blockquote|ul|ol|li|pre|hr)$/i)
}

function tokenType(node) {
  const tag = node.tagName && node.tagName.toLowerCase()

  if (!tag) {
    return 'paragraph'
  }

  if (tag.toLowerCase === 'code') {
    return isBlock(node) ? 'fence' : 'code_inline'
  }

  const types = {
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    p: 'paragraph',
    ul: 'bullet_list',
    ol: 'ordered_list',
    li: 'list_item',
    a: 'link',
  }

  return types[tag] || tag
}
