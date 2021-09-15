const hash = require('object-hash')
const marked = require('marked')
const frontMatter = require('front-matter')

module.exports = {
    parse
}

function parse( md, basename ) {
    const { body, attributes } = frontMatter(md)
    const defaultLang = attributes.lang || 'text'

    const tokens = marked.lexer(body).map( function (token, index) {
      if ( token.type === "code" ) {
        const assign = {
          id: `krumb-${index}`,
          lang: token.lang || defaultLang
        }
        return Object.assign(token, assign)
      } else {
        return token
      }
    })

    const { title, platform, model, imports } = attributes

    let result = {
      title,
      basename,
      platform,
      languages: getLanguages(tokens),
      init: model,
      shape: getShapeOf(model),
      imports: getImportSpecs(imports),
      doc: tokens
    }

    const hashkey = hashcode(result)
    const moduleName = `Kram_${hashkey}_${basename}`

    return Object.assign({hashkey, moduleName}, result)
}


function getLanguages ( tokens ) {
    return tokens.filter( t => t.type === "code")
        .map( t => t.lang )
        .reduce(
            (accum, next) => accum.includes(next) ?
                accum : accum.concat([next]),
            []
        )
}

function getImportSpecs( imports ) {
  switch( getTypeOf(imports) ) {
    case 'array':
      return imports.map( importSpec )
    case 'record':
      return Object.entries( imports || {} )
        .map( ([k, v]) => importSpec(k, v) )
    case 'string':
      return [importSpec(imports)]
    default:
      return []
  }
}

function importSpec( pkg, spec ) {
  switch( getTypeOf(spec) ) {
    case 'record':
      return Object.assign( spec, { as: pkg } )
    case 'string':
      return { from: spec, as: pkg }
    default:
      return { from: pkg, as: pkg }
  }
}

function getShapeOf( model ) {
  const type = getTypeOf(model)

  switch( type ) {
    case 'array':
      return { [type]: getShapeOf(model[1]) }
    case 'record':
      fields = Object.entries(model)
        .map( ([k, v]) => [k, getShapeOf(v)] )
      return { [type]: Object.fromEntries(fields) }
    default:
      return type
  }
}

function getTypeOf( value ) {
  const type = typeof value

  switch ( type ) {
    case 'object':
      return Array.isArray( value ) ? 'array' : 'record'
    case 'number':
      return Number.isInteger( value ) ? 'int' : 'float'
    default:
      return type
  }
}

function hashcode( {platform, imports, shape, doc}, lang ) {
    const code = doc
        .filter( t => t.type === "code" && (!lang || t.lang === lang ))

    return hash({platform, imports, shape, code}).substr(-8)
}
