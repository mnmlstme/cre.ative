module.exports = {
  rules: {
    heading_open: open_element,
    heading_close: close_element,
    paragraph_open: open_element,
    paragraph_close: close_element,
    blockquote_open: open_element,
    blockquote_close: close_element,
    bullet_list_open: open_element,
    bullet_list_close: close_element,
    ordered_list_open: open_element,
    ordered_list_close: close_element,
    list_item_open: open_element,
    list_item_close: close_element,
    table_open: open_element,
    table_close: close_element,
    thead_open: open_element,
    thead_close: close_element,
    tbody_open: open_element,
    tbody_close: close_element,
    tr_open: open_element,
    tr_close: close_element,
    th_open: open_element,
    th_close: close_element,
    td_open: open_element,
    td_close: close_element,
    text: insert_text,
    softbreak: insert_newline,
    hr: insert_empty_element,
    code_inline: insert_code,
    fence: insert_code_block,
    strong_open: open_element,
    strong_close: close_element,
    em_open: open_element,
    em_close: close_element,
    link_open: open_element,
    link_close: close_element,
    html_block: insert_code_block, // escaping html for now
    html_inline: insert_code, // escaping html for now
  },
  not_implemented,
}

const nl = (b) => (b ? '\n' : '')

function open_element(tokens, i) {
  const { type, block, attrs, tag, markup } = tokens[i]
  const ts = JSON.stringify(type.replace(/_(open|close)$/, ''))
  const attrjson = attrs && attrs.length ? Object.fromEntries(attrs) : {}
  const json = JSON.stringify(
    Object.assign(attrjson, {
      tag: tag.toLowerCase(),
      block,
      markup,
    })
  )
  const out = `,${nl(block)}[${ts},${json}`

  // console.log(`open_element(${type}) -> `, out)

  return out
}

function close_element(tokens, i) {
  const { type } = tokens[i]

  // console.log(`close_element(${type}) -> ]`)

  return ']'
}

function insert_empty_element(tokens, i) {
  return open_element(tokens, i) + ']'
}

function insert_text(tokens, i) {
  const { content } = tokens[i]
  const json = JSON.stringify(content)
  const out = content ? `,${json}` : ''

  // console.log(`insert_text(${content}) -> `, out)

  return out
}

function insert_newline() {
  // console.log(`insert_newline() -> `, ', \\n')

  return ',"\\n"'
}

function insert_code(tokens, i) {
  const { type, tag, block, markup, info, content } = tokens[i]
  const json = JSON.stringify([
    type,
    {
      tag: tag.toLowerCase(),
      block,
      markup,
    },
    content,
  ])
  const out = `,${nl(block)}${json}`

  // console.log(`insert_code(${type}) -> `, out)

  return out
}

function insert_code_block(tokens, i) {
  const { type, tag, block, markup, info, content } = tokens[i]
  const json = JSON.stringify([
    type,
    {
      tag,
      preformatted: true,
      lang: info.toLowerCase(),
      markup,
      block,
      id: `krumb-${i}`,
    },
    content,
  ])
  const out = `,${nl(block)}${json}`

  // console.log(`insert_code_block(${type} -> `, out)

  return out
}

function not_implemented(tokens, i) {
  const { type } = tokens[i]

  console.log(`renderer.rule.${type} not implemented`)
}
