const { parse } = require('./parse')
const { format } = require('./format')
const { extract } = require('./extract')
const { recordType, scalarType, arrayType } = require('./utils')

module.exports = {
  parse,
  format,
  extract,
  embed,
  render,
  recordType,
  scalarType,
  arrayType
}

function render ({code, model, imports}, renderer, moduleName) {
    // const krammer = require(`./platforms/${platform}.js`)

    return {
        collate: function ( code, lang) {
            return renderer.collate(front, code, lang)
        },

        bind: function ( node ) {
            return renderer.bind(pkg, node)
        }
    }
}

function embed (kramule, node) {
  kramule.bind(node)
}
