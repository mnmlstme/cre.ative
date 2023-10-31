const hash = require('object-hash')
const MarkdownIt = require('markdown-it')
const frontMatter = require('front-matter')
const { rules } = require('./render')

module.exports = {
  parse,
}

const mdit = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

Object.assign(mdit.renderer.rules, rules)

function parse(md, basename) {
  const { body, attributes } = typeof md === 'string' ? frontMatter(md) : md
  const defaultLang = attributes.lang || 'text'
  const tokens = mdit.parse(body)
  const flat = tokens.reduce(
    (l, r) => (r.type === 'inline' ? l.concat(r.children) : l.concat([r])),
    []
  )
  const unhandled = flat.filter(
    (t) => t.type !== 'inline' && typeof rules[t.type] !== 'function'
  )
  const json = `[{}${mdit.render(body)}]`

  const blocks = JSON.parse(json).slice(1)
  const { title, platform, model, imports } = attributes

  const result = {
    title,
    basename,
    platform,
    languages: getLanguages(blocks),
    init: model,
    shape: getShapeOf(model),
    imports: getImportSpecs(imports),
    scenes: paginate(blocks),
  }

  const hashkey = hashcode(result)
  const moduleName = `Kram_${hashkey}_${basename}`

  return Object.assign({ hashkey, moduleName }, result)
}

function paginate(blocks) {
  const isBreak = (b) =>
    Array.isArray(b) && b.length === 2 && b[0] === 'hr' && b[1].markup === '---'
  let breaks = blocks
    .map((b, i) => (isBreak(b) ? i : false))
    .filter((i) => i !== false)

  breaks.unshift(-1)

  return breaks
    .map((b, i) => blocks.slice(b + 1, breaks[i + 1]))
    .map(blocksToScene)
}

function blocksToScene(blocks) {
  const headings = blocks.filter((b) => b[0] === 'heading')

  return Object.assign(
    { blocks },
    headings.length ? { title: textContent(headings[0]) } : {}
  )
}

function textContent(t) {
  return typeof t === 'string'
    ? t
    : Array.isArray(t)
    ? t
        .slice(1)
        .map((s) => textContent(s))
        .join('')
    : ''
}

function getLanguages(tokens) {
  return tokens
    .filter(([type]) => type === 'fence')
    .map(([_, attrs]) => attrs.lang)
    .reduce(
      (accum, next) => (accum.includes(next) ? accum : accum.concat([next])),
      []
    )
}

function getImportSpecs(imports) {
  switch (getTypeOf(imports)) {
    case 'array':
      return imports.map(importSpec)
    case 'record':
      return Object.entries(imports || {}).map(([k, v]) => importSpec(k, v))
    case 'string':
      return [importSpec(imports)]
    default:
      return []
  }
}

function importSpec(spec, pkg) {
  switch (getTypeOf(spec)) {
    case 'record':
      return pkg ? Object.assign(spec, { from: pkg }) : spec
    case 'string':
      return { from: pkg || spec, as: spec }
    default:
      return { from: pkg, as: pkg }
  }
}

function getShapeOf(model) {
  const type = getTypeOf(model)

  switch (type) {
    case 'array':
      return { [type]: getShapeOf(model[1]) }
    case 'record':
      fields = Object.entries(model).map(([k, v]) => [k, getShapeOf(v)])
      return { [type]: Object.fromEntries(fields) }
    default:
      return type
  }
}

function getTypeOf(value) {
  const type = typeof value

  switch (type) {
    case 'object':
      return Array.isArray(value) ? 'array' : 'record'
    case 'number':
      return Number.isInteger(value) ? 'int' : 'float'
    default:
      return type
  }
}

function hashcode({ platform, imports, shape, scenes }, lang) {
  const code = scenes.map((scn) => scn.code)
  const views = scenes.map((scn) => scn.view || {})

  return hash({ platform, imports, shape, code, views }).substr(-8)
}
