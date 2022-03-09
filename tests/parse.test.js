const {parse, defaultPlugin} = require('../src/parse')

test('parses frontmatter', () => {
  const title = 'My Testing Workbook'
  const basename = 'test_workbook'
  const platform = 'web-standard'
  const pkg = '../src/some-thing.js'
  const alias = 'Th'
  const md = `---
title: ${title}
platform: ${platform}
imports:
  ${alias}: ${pkg}
---`
  const out = parse(md, basename)

  expect(out.basename).toBe(basename)
  expect(out.title).toBe(title)
  expect(out.platform).toBe(platform)
  expect(out.imports).toHaveLength(1)
  expect(out.imports[0].from).toBe(pkg)
  expect(out.imports[0].as).toBe(alias)
})

test_header(1, 'h1', '#')
test_header(2, 'h2', '##')
test_header(3, 'h3', '###')

function test_header(n, t, m) {
  test(`parses header ${n}`, () => {
    const ttl = 'My Testing Workbook'
    const md = `${m} ${ttl}\n`

    const {scenes} = parse(md)
    expect(scenes).toHaveLength(1)

    const {title, blocks} = scenes[0]
    expect(title).toBe(ttl)
    expect(blocks).toHaveLength(1)

    const [head, content] = blocks[0]
    expect(head.type).toBe('heading')
    expect(head.tag).toBe(t)
    expect(head.markup).toBe(m)
    expect(content).toBe(ttl)
  })
}

test('parses paragraphs', () => {
  const md = `Line breaks
are allowed in paragraph contents.

A blank line (two consecutive newlines)
separates paragraphs.
`
  const {scenes} = parse(md)
  expect(scenes).toHaveLength(1)

  const {title, blocks} = scenes[0]
  expect(title).toBeUndefined()
  expect(blocks).toHaveLength(2)

  blocks.forEach( p => {
    expect(p).toHaveLength(3)

    const [head, ...rest] = p
    expect(head.tag).toBe('p')
  })
})

test('parses bullet lists', () => {
  const md = `* One
* Two
* Three
`
  const {scenes} = parse(md)
  expect(scenes).toHaveLength(1)

  const {title, blocks} = scenes[0]
  expect(title).toBeUndefined()
  expect(blocks).toHaveLength(1)

  const [head, ...list] = blocks[0]
  expect(head.type).toBe('bullet_list')
  expect(head.tag).toBe('ul')
  expect(head.markup).toBe('*')

  list.forEach( li => {
    expect(li).toHaveLength(2)

    const [head, p] = li
    expect(head.type).toBe('list_item')
    expect(head.tag).toBe('li')
    expect(head.markup).toBe('*')
    expect(p).toHaveLength(2)
    expect(p[0].tag).toBe('p')
    expect(p[1]).toMatch(/^(One|Two|Three)$/)
  })
})

test('parses numbered lists', () => {
  const md = `1. One
2. Two
3. Three
`
  const {scenes} = parse(md)
  expect(scenes).toHaveLength(1)

  const {title, blocks} = scenes[0]
  expect(title).toBeUndefined()
  expect(blocks).toHaveLength(1)

  const [head, ...list] = blocks[0]
  expect(head.type).toBe('ordered_list')
  expect(head.tag).toBe('ol')
  expect(head.markup).toBe('.')

  list.forEach( li => {
    expect(li).toHaveLength(2)

    const [head, p] = li
    expect(head.type).toBe('list_item')
    expect(head.tag).toBe('li')
    expect(head.markup).toBe('.')
    expect(p).toHaveLength(2)
    expect(p[0].tag).toBe('p')
    expect(p[1]).toMatch(/^(One|Two|Three)$/)
  })
})

test('parses code fences', () => {
  const qqq = '```'
  const md = `${qqq}html
<p>
  Hello World.
</p>
${qqq}`

  const {scenes} = parse(md)
  expect(scenes).toHaveLength(1)

  const {title, blocks} = scenes[0]
  expect(title).toBeUndefined()
  expect(blocks).toHaveLength(1)

  const [head, code] = blocks[0]
  expect(head.type).toBe('fence')
  expect(head.tag).toBe('pre')
  expect(head.markup).toBe(qqq)
  expect(head.lang).toBe('html')
  expect(code.split('\n')).toHaveLength(4)
  expect(code).toMatch(/\n$/)
})

test('parses inline markup', () => {
  const md = '# **Strong** _Emphatic_ `Code`'

  const {scenes} = parse(md)
  expect(scenes).toHaveLength(1)

  const {title, blocks} = scenes[0]
  console.log('Scene 1:', title, blocks)
  expect(title).toBe('Strong Emphatic Code')
  expect(blocks).toHaveLength(1)

  const [head, ...tokens] = blocks[0]
  expect(head.type).toBe('heading')
  expect(head.tag).toBe('h1')
  expect(head.markup).toBe('#')
  expect(tokens).toHaveLength(5)
})


test(`paginates markdown`, () => {
  const ttl = 'My Testing Workbook'
  const t = ['Scene 1', 'Scene 2', 'Scene 3']
  const md = `---
title: ${ttl}
---
# *${t[0]}*
---
## __${t[1]}__
---
### ${t[2]}\n`

  const {title, scenes} = parse(md)
  expect(title).toBe(ttl)
  expect(scenes).toHaveLength(3)

  scenes.forEach((s, i) => {
    const {title, blocks} = s
    expect(title).toBe(t[i])
    expect(blocks).toHaveLength(1)
  })
})
