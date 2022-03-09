module.exports = {
  rules: {
    heading_open: open_element,
    heading_close: close_element,
    paragraph_open: open_element,
    paragraph_close: close_element,
    bullet_list_open: open_element,
    bullet_list_close: close_element,
    ordered_list_open: open_element,
    ordered_list_close: close_element,
    list_item_open: open_element,
    list_item_close: close_element,
    softbreak: () => '',
    text: insert_text,
    hr: insert_empty_element,
    code_inline: insert_code,
    fence: insert_code_block,
    strong_open: open_element,
    strong_close: close_element,
    em_open: open_element,
    em_close: close_element,
  },
  not_implemented
}

function open_element(tokens, i) {
  const {type, tag, markup} = tokens[i]
  const json = JSON.stringify({
    type: type.replace(/_(open|close)$/, ''),
    tag: tag.toLowerCase(),
    markup
  })

  return `,[${json}`
}

function close_element(tokens, i) {
  return ']'
}

function insert_empty_element(tokens, i) {
  return open_element(tokens, i) + ']'
}

function insert_text(tokens, i) {
  const {content} = tokens[i]
  const json = JSON.stringify(content)

  return content ? `,${json}` : ''
}

function insert_code(tokens, i) {
  const {type, tag, block, markup, info, content} = tokens[i]
  const json = JSON.stringify([
    {
      type: type,
      tag: tag.toLowerCase(),
      block,
      markup
    },
    content
  ])

  return `,${json}`
}

function insert_code_block(tokens, i) {
  const {type, tag, block, markup, info, content} = tokens[i]
  const json = JSON.stringify([
    {
      type: type,
      tag: 'pre',
      lang: info.toLowerCase(),
      markup,
      block
    },
    content
  ])

  return `,${json}`
}


function not_implemented(tokens, i) {
  const {type} = tokens[i]

  console.log(`renderer.rule.${type} not implemented`)
}
