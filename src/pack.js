const { stringify } = require("yaml");
const { parse } = require("node-html-parser");

module.exports = { pack };

function pack(wb) {
  const frontMatter = configToYaml(wb)
  const mdPages = wb.scenes.map(sceneToMarkdown);

  return ["", frontMatter].concat(mdPages).join("---\n");
}

function configToYaml(wb) {
  const { title, init, platform, imports } = wb;
  const order = [
    { title },
    { platform },
    { imports: importsToYaml(imports) },
    { model: init },
  ];

  return order.map(stringify).join("");
}

function importsToYaml(imports) {
  return imports;
}

function sceneToMarkdown(scn) {
  return scn.blocks.map(blockToMarkdown).join("\n");
}

function blockToMarkdown(blk) {
  const [type, { markup, block, lang }, ...rest] = blk;
  const contents = rest ? inlineToMarkdown(rest) : ''

  switch (type) {
    case 'fence':
      return `${markup}${lang}\n${rest[0]}\n${markup}\n`;
    case 'bullet_list':
    case 'ordered_list':
      return rest
        .filter(b => Array.isArray(b) && b.length && b[0] === 'list-item')
        .map(blockToMarkdown).join('\n')
    case 'paragraph':
      return `${markup}${contents}\n\n`
    case 'heading':
    case 'list-item':
      return `${markup} ${contents}\n`
    case 'hr':
      return `${markup}\n`
    default:
      return typeof markup === undefined || !markup
        ? contents
        : block
          ? `${markup} ${contents}\n`
          : `${markup}${contents}${markup}`
  }

}

function inlineToMarkdown(list) {
  return list ? list.map(inlineNodeToMarkdown).join('') : ''
}

function inlineNodeToMarkdown(node) {
  if (Array.isArray(node))  {
    const [type, {markup, href}, ...rest] = node
    const contents = inlineToMarkdown(rest)
    switch( type ){
      case 'link':
        const parens = href ? `(${href})` : ''

        return `[${inlineToMarkdown(rest)}]()`
      default:
        return `${markup}${contents}${markup}`
    }
  } else {
    return node
  }

}
