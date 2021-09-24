const marked = require('marked')

module.exports = {
    format
}

function format( wb ) {
  return wb.scenes
    .map( tokens => marked.parser(tokens) )
}
