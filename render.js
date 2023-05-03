const he = require("he");
const Kr = require("@cre.ative/kram");
const MarkdownIt = require("markdown-it");
const path = require("node:path");

module.exports = { render };

const mdit = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

function render(scenes, data, files, importMap) {
  const { title, model = {}, runtime } = data;

  return `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<script type="importmap">
{ "imports": ${JSON.stringify(importMap)} }
</script>
<link rel="stylesheet" href="/styles/theme.css">
${genCssDefs(files)}
</head>
<body>
<kram-main>
<kram-nav>
<span slot="title">${title}</title>
</kram-nav>
<kram-flow>
${genScenes(scenes)}
</kram-flow>
</kram-main>
${genHtmlDefs(files)}
${genSvgDefs(files)}
<script type="module">
${genRuntimeInit(model, runtime)}
${genModuleImports(files, model)}
</script>
</body>
</html>
`;
}

function genCssDefs(files) {
  return files
    .filter((f) => f.language === "css")
    .map((f) => `<link rel="stylesheet" href="${f.filename}"/>`)
    .join("\n");
}

function genHtmlDefs(files) {
  return files
    .filter((f) => f.language === "html")
    .map((f) => f.code)
    .join("\n");
}

function genSvgDefs(files) {
  return files
    .filter((f) => f.language === "svg")
    .map((f) => f.code)
    .join("\n");
}

function genRuntimeInit(model, runtime) {
  return `
    import {register, init} from "${runtime}";
    init(${JSON.stringify(model)});
  `;
}

function genModuleImports(files) {
  console.log("Modules:", JSON.stringify(files.map((f) => f.name)));
  const mustImport = (type) => !["html", "svg", "css"].includes(type);
  return (
    files
      // .filter((f) => mustImport(f.language))
      .map(
        (f) =>
          `import("${f.filename}")
          .then((mod) => register(mod, "${f.name}"))`
      )
      .join("\n")
  );
}

function genScenes(scenes) {
  const sceneBlocks = scenes.map(({ blocks }, i) => {
    const prose = blocks
      .filter((blk) => !isEvalBlock(blk))
      .map(genProse)
      .join("\n");
    const evalcode = blocks
      .filter(isEvalBlock)
      .map(([_, { lang }, ...rest]) => {
        const code = rest.join("\n");
        return `<code lang="${lang}" class="language-${lang}">${code}</code>`;
      })
      .join("\n");

    return [`<kram-scene scene="${i}">${prose}</kram-scene>`];
  });

  return sceneBlocks.flat().join("\n");
}

function isEvalBlock(blk) {
  const [type, attr = {}] = blk;

  return type === "fence" && attr.mode === "eval";
}

function genProse(blk) {
  const [type, { tag, lang }, ...rest] = blk;

  // console.log(`genProse(${type}, {tag:${tag}}, ... ${rest.length} inside)`);

  switch (type) {
    case "html_block":
      return rest.join("\n");
    case "fence":
      const code = rest.join("\n");
      return `<kram-code data-language="${lang}"><code class="language-${lang}">${code}</code></kram-code>`;
    case "bullet_list":
    case "ordered_list":
    case "list_item":
      return `<${tag}>${rest.map(genProse).join("\n")}</${tag}>\n`;
    default:
      return `<${tag}>${jsonToHtml(rest)}</${tag}>\n`;
  }
}

function jsonToHtml(tokens) {
  // console.log("jsonToHtml", JSON.stringify(tokens, null, ""));

  const out = tokens
    .map((t) => (typeof t === "string" ? encodeAsHtml(t) : tokenToHtml(t)))
    .join("");

  // console.log("jsonToHtml", JSON.stringify(tokens, null, ""));
  // console.log(" --->", out);

  return out;
}

function encodeAsHtml(text) {
  return he.encode(text, {
    useNamedReferences: true,
    decimal: true,
  });
}

function tokenToHtml([type, attrs, ...children]) {
  const { tag, block, markup, href } = attrs;
  if (type === "html_inline") {
    // console.log("HTML out:", JSON.stringify(children));
    return children.join("\n");
  }
  const hrefPair = href && ["href", href];
  const markPair = markup &&
    !type.match(/\w+_list/) &&
    markup != "" && [`data-mark-${block ? "before" : "around"}`, markup];
  const htmlAttrs = [markPair, hrefPair]
    .filter(Boolean)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");

  return children
    ? `<${tag}${htmlAttrs}>${jsonToHtml(children)}</${tag}>`
    : `<${tag}${htmlAttrs}/>`;
}
