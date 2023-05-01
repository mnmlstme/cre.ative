const { stringify } = require('yaml')
const { parse } = require('node-html-parser')

module.exports = { pack }

function pack(wb) {
  const frontMatter = configToYaml(wb)
  const mdPages = wb.scenes.map(sceneToMarkdown)

  return ['', frontMatter].concat(mdPages).join('---\n')
}

function configToYaml(wb) {
  const { title, init, platform, imports } = wb
  const order = [
    { title },
    { platform },
    { imports: importsToYaml(imports) },
    { model: init },
  ]

  return order.map(stringify).join('')
}

function importsToYaml(imports) {
  return imports
}

function sceneToMarkdown(scn) {
  return scn.blocks.map(blockToMarkdown).join('\n')
}

function blockToMarkdown(blk) {
  const [type, { markup, block, lang }, ...rest] = blk

  switch (type) {
    case 'fence':
      return `${markup}${lang}\n${rest[0]}${markup}\n`
    case 'bullet_list':
    case 'ordered_list':
      return `${blocksToMarkdown(rest, false)}\n`
    case 'paragraph':
      return `${inlineToMarkdown(rest)}\n`
    case 'heading':
      return `${markup} ${inlineToMarkdown(rest)}`
    case 'list-item':
      return `${markup} ${blocksToMarkdown(rest, false)}`
    case 'hr':
      return `${markup}\n`
    default:
      const contents = inlineToMarkdown(rest)
      return typeof markup === undefined || !markup
        ? contents
        : block
        ? `${markup} ${contents}\n`
        : `${markup}${contents}${markup}`
  }
}

function blocksToMarkdown(list, newlines = true) {
  return list ? list.map(blockToMarkdown).join(newlines ? '\n' : '') : ''
}

function inlineToMarkdown(list) {
  return list ? list.map(inlineNodeToMarkdown).join('') : ''
}

function inlineNodeToMarkdown(node) {
  if (Array.isArray(node)) {
    const [type, { markup, href }, ...rest] = node
    const contents = inlineToMarkdown(rest)
    switch (type) {
      case 'link':
        const parens = href ? `(${href})` : ''

        return `[${inlineToMarkdown(rest)}]${parens}`
      default:
        return `${markup}${contents}${markup}`
    }
  } else {
    return node
  }
}
