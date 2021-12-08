const { stringify } = require("yaml");
const { parse } = require("node-html-parser");

module.exports = { pack };

function pack(wb) {
  const frontMatter = log("frontMatter", configToYaml(wb));
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
  return scn.blocks.map((b) => log("blkToMd", blockToMarkdown(b))).join("\n");
}

function blockToMarkdown(blk) {
  const bqbqbq = "```";

  const { mode, lang, text } = blk;

  console.log("Block", blk);

  if (mode === "discuss") {
    if (lang === "markdown" || lang === "md") {
      return `${text}\n`;
    } else if (lang === "html") {
      return htmlToMarkdown(text);
    } else {
      return `${bqbqbq}${lang}\n${text}\n${bqbqbq}\n`;
    }
  } else {
    return `${bqbqbq}${lang}\n${text}\n${bqbqbq}\n`;
  }
}

function htmlToMarkdown(html) {
  const root = parse(html);

  return root.childNodes
    .map((n) => log("nodeToMd", nodeToMarkdown(n) || ""))
    .join("\n");
}

function nodeToMarkdown(node) {
  const { tagName, innerHTML, outerHTML, childNodes } = node;

  console.log("n2md input:", node);

  switch (tagName && tagName.toLowerCase()) {
    case "br":
      return "\n\n";
    case "p":
      return `${innerHTML}`;
    case "h1":
      return `# ${innerHTML}`;
    case "h2":
      return `## ${innerHTML}`;
    case "h3":
      return `### ${innerHTML}`;
    case "ol":
      return listToMarkdown("1.", childNodes);
    case "ul":
      return listToMarkdown("*", childNodes);
    default:
      return "";
  }
}

function log(prefix, value) {
  console.log(prefix, value);
  return value;
}

function listToMarkdown(prefix, nodes) {
  // TODO: nested lists
  return nodes.map((n) => `${prefix} ${n.innerHtml}`).join("\n");
}
