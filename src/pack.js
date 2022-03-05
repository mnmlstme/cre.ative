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
  const bqbqbq = "```";

  const { tag, html, code, lang } = blk;

  if (typeof code !== 'undefined') {
    return `${bqbqbq}${lang}\n${code}\n${bqbqbq}\n`;
  } else {
    return htmlToMarkdown(tag, html);
  }
}

function htmlToMarkdown(tagName, inner) {
  const root = parse(inner);
  const innerMd = inlineToMarkdown(root.childNodes)

  switch (tagName && tagName.toLowerCase()) {
    case "br":
      return "\n\n";
    case "p":
      return `${innerMd}\n`;
    case "h1":
      return `# ${innerMd}\n`;
    case "h2":
      return `## ${innerMd}\n`;
    case "h3":
      return `### ${innerMd}\n`;
    case "ol":
      return `${listToMarkdown("1.", root.childNodes)}\n`;
    case "ul":
      return `${listToMarkdown("*", root.childNodes)}\n`;
    default:
      return inner;
  }
}

function inlineToMarkdown(nodelist) {
  return nodelist.map(inlineNodeToMarkdown).join('')
}

const inlineTagToMark = {
  strong: '**',
  em: '_',
  code: '`',
  b: '*',
  i: '_'
}

function inlineNodeToMarkdown(node) {
  const {nodeType, tagName, attributes, childNodes, rawText} = node

  if (typeof tagName !== 'undefined')  {
    const tag = tagName.toLowerCase()
    const contents = childNodes ? inlineToMarkdown(childNodes) : ''

      switch( tag ){
        case "strong":
        case "em":
        case "code":
        case "b":
        case "i":
          const mark = attributes['data-mark-around'] || inlineTagToMark[tag]
          return mark ? `${mark}${contents}${mark}` : `<${tag}>${contents}</${tag}>`
        case "a":
          const href = attributes['href']
          const parens = href ? `(${href})` : ''
          return `[${contents}]${parens}`
        default:
          return `<${tag}>${contents}</${tag}>`
      }
  } else {
    return rawText
  }

}

function listToMarkdown(prefix, nodelist) {
  return nodelist
    .filter(n => n.tagName && n.tagName.toLowerCase() === 'li')
    .map(n => liToMarkdown(prefix, n)).join('\n')
}

function liToMarkdown(prefix, node) {

  // TODO: nested lists
  return `${prefix} ${inlineToMarkdown(node.childNodes)}`
}
