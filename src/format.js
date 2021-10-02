const marked = require('marked')

module.exports = {
    format
}

function format( wb ) {
  return wb.scenes
    .map( scene => marked.parser(scene.doc) )
}
