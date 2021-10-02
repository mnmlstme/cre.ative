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
      scenes: paginate(tokens).map(toScene)
    }

    console.log("Workbook:", result)

    const hashkey = hashcode(result)
    const moduleName = `Kram_${hashkey}_${basename}`

    return Object.assign({hashkey, moduleName}, result)
}


function paginate( tokens ) {
  let breaks = tokens
    .map((t, i) => t.type === 'hr' ? i : false)
    .filter(i => !!i)

  breaks.unshift(-1)

  return breaks.map((b, i) =>
    tokens.slice(b+1, breaks[i+1])
  )
}

function toScene( tokens ) {
  // The view is the first token, as long as code
  const code = tokens.filter( t => t.type === 'code')
  const view = tokens[0] === code[0] ? code[0] : undefined

  return {
    view,
    // exclude the view from the doc and the code
    doc: view ? tokens.slice(1) : tokens,
    definitions: view ? code.slice(1) : code
  }
}

function getLanguages ( tokens ) {
    return tokens.filter( t => t.type === 'code')
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

function hashcode( {platform, imports, shape, scenes}, lang ) {
    const code = scenes.map( scn => scn.code )
    const views = scenes.map( scn => scn.view || {})


    return hash({platform, imports, shape, code, views}).substr(-8)
}
