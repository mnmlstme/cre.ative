import React from 'react'
import he from 'he'

export class Block extends React.Component {
  constructor(props) {
    super(props)

    this.root = React.createRef()
    this.handleChange = this.handleChange.bind(this)
    this.handleInsertion = this.handleInsertion.bind(this)
    this.handleReplacement = this.handleReplacement.bind(this)
  }

  handleChange(e) {
    const { block, path, onUpdate } = this.props
    const children = e.target.childNodes
    const [type, attrs] = block
    const { uniqueId } = attrs
    const token = [type, attrs].concat(nodesToTokens(children))

    onUpdate && onUpdate(path || [uniqueId], 1, token)
  }

  handleInsertion(e) {
    const { block, path, onUpdate } = this.props
    const [_, { uniqueId }] = block
    const { node } = e.detail
    const token = elementToToken(node)

    onUpdate && onUpdate(path || [uniqueId], 0, token)
  }

  handleReplacement(e) {
    const { block, path, onUpdate } = this.props
    const [_, { uniqueId }] = block
    const { replacements } = e.detail
    const idOfNode = (n) => (n === this.root.current ? { uniqueId } : {})
    const blocks = replacements.map((n) => elementToToken(n, idOfNode(n)))

    onUpdate && onUpdate(path || [uniqueId], 1, ...blocks)
  }

  shouldComponentUpdate(nextProps) {
    const { className, block, disabled } = nextProps
    const [type, attrs, ...rest] = block
    const { uniqueId, tag, markup, lang } = attrs
    const el = this.root.current
    const inner = jsonToHtml(rest)

    if (!el) {
      return true
    }

    //console.log('ShouldComponentUpdate?', uniqueId)

    if (inner !== normalizeInnerHtml(el.innerHTML, true)) {
      // console.log(
      //  `Content changed from outside, must update ${uniqueId}:`,
      //  inner
      // )
      return true
    } else {
      return (
        className !== this.props.className ||
        disabled !== this.props.disabled ||
        uniqueId !== this.props.block[1].uniqueId ||
        tag !== this.props.block[1].tag ||
        markup !== this.props.block[1].markup ||
        lang !== this.props.block[1].lang
      )
    }
  }

  componentDidMount() {
    this.root.current.addEventListener('block:change', this.handleChange)
    this.root.current.addEventListener('block:insert', this.handleInsertion)
    this.root.current.addEventListener('block:replace', this.handleReplacement)
  }

  componentWillUnmount() {
    this.root.current.removeEventListener(
      'block:replace',
      this.handleReplacement
    )
    this.root.current.removeEventListener('block:insert', this.handleInsertion)
    this.root.current.removeEventListener('block:change', this.handleChange)
  }

  render() {
    const { className, block, mode, disabled } = this.props
    const [type, attrs, ...rest] = block
    const { tag, markup, lang } = attrs
    const spellCheck = type !== 'fence'
    const inner = jsonToHtml(rest)
    // console.log('Block#render', block)

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

function normalizeInnerHtml(html, block = false) {
  // Undo the various effects of setting/getting innerHTML in browser
  const noBrHtml = block ? html.replace(/<br>$/, '') : html

  return noBrHtml.replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

function jsonToHtml(tokens) {
  return tokens
    .map((t) => (typeof t === 'string' ? encodeAsHtml(t) : tokenToHtml(t)))
    .join('')
}

function encodeAsHtml(text) {
  return he.encode(text, {
    useNamedReferences: true,
    decimal: true,
  })
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

function elementToToken(node, moreAttrs) {
  const type = tokenType(node)
  const block = isBlock(node)
  const attrEntries = [
    ['tag', node.tagName && node.tagName.toLowerCase()],
    ['block', block],
    ['markup', block ? node.dataset.markBefore : node.dataset.markAround],
    ['lang', node.getAttribute('lang')],
    ['href', node.getAttribute('href')],
  ]
    .concat(Object.entries(moreAttrs || {}))
    .filter((pair) => typeof pair[1] === 'string' && pair[1] !== '')

  const rest = node.hasChildNodes()
    ? nodesToTokens(node.childNodes, block, type === 'fence')
    : []

  return [type, Object.fromEntries(attrEntries)].concat(rest)
}

function nodesToTokens(nodeList, block = true, preformatted = false) {
  const children = Array.from(nodeList)
  // Browser may add <br> elements at end of blocks; if so, elide them
  const last = children.length - 1
  const legitChildren = block
    ? children.filter(
        (node, i) =>
          i !== last ||
          node.nodeType !== Node.ELEMENT_NODE ||
          !node.tagName ||
          node.tagName.toLowerCase() !== 'br'
      )
    : children

  return legitChildren.map((node) => {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        return elementToToken(node)
      case Node.TEXT_NODE:
      default:
        return node.nodeValue
    }
  })
}

function isBlock(node) {
  const tag = node.tagName

  if (!tag) {
    return false
  }

  if (tag.toLowerCase() === 'code') {
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

  if (tag.toLowerCase() === 'code') {
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
