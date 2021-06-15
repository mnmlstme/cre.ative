const marked = require('marked')
const frontMatter = require('front-matter')

module.exports = {
    parse,
    html
}

function parse( md ) {
    const { body, attributes } = frontMatter(md)
    const { platform } = attributes
    const defaultLang = platform.replace(/-.*$/, '')

    const doc = marked.lexer(body).map( function (token, index) {
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

    return { front: attributes, doc }
}

function html( doc ) {
    return marked.parser(doc)
}
