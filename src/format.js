const marked = require('marked')

module.exports = {
    format
}

function format( workbook ) {
  const tokens = workbook.doc
  return marked.parser(tokens)
}
