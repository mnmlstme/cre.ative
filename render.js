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

function render(scenes, modules, importMap, data = {}) {
  const { title, model = {}, runtime, styles } = data;

  return `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<script type="importmap">
{ "imports": ${JSON.stringify(importMap)} }
</script>
<link rel="stylesheet" href="${importMap[styles]}">
<script type="module">
import {init, register} from "${runtime}";
${genInit(model, "init")}
${genModuleImports(modules, "register")}
</script>
</head>
<body>
<kram-main>
<h1 slot="title">${title}</h1>
<kram-flow>
${genScenes(scenes)}
</kram-flow>
</kram-main>
</body>
</html>
`;
}

function genInit(model, init = "init") {
  return `${init}(${JSON.stringify(model)});`;
}

function genModuleImports(modules, reg = "register") {
  // console.log(
  //   "Modules:",
  //   JSON.stringify(modules.map((f) => [f.moduleName, f.filepath, f.bind]))
  // );
  return modules
    .map(
      (f) =>
        `import("${f.filepath}")
          .then((mod) => ${reg}(mod, "${f.moduleName}", "${f.language}", ${
          f.bind || "null"
        }))`
    )
    .join("\n");
}

function genScenes(scenes) {
  const sceneBlocks = scenes.map(({ blocks }, i) => {
    const prose = blocks
      .filter((blk) => !isEvalBlock(blk))
      .map(genProse)
      .join("\n");
    let language = null;
    const evalcode = blocks
      .filter(isEvalBlock)
      .map(([_, { lang }, ...rest]) => {
        const code = rest.join("\n");
        if (lang && !language) {
          language = lang;
        }
        lang = lang || "text";
        return `<kram-code slot="scenecode" data-language="${lang}"
          ><code lang="${lang}" class="language-${lang}"
            >${encodeAsHtml(code)}</code></kram-code>`;
      })
      .join("\n");

    return [
      `<kram-scene scene="${i + 1}" language="${language}"
        >${evalcode}${prose}</kram-scene>`,
    ];
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
      return `<kram-code data-language="${lang}"
        ><code class="language-${lang}"
          >${encodeAsHtml(code)}</code></kram-code>`;
    case "bullet_list":
    case "ordered_list":
    case "list_item":
      return `<${tag}>${rest.map(genProse).join("\n")}</${tag}>\n`;
    case "heading":
      if (tag === "h1") {
        return `<${tag} slot="title">${jsonToHtml(rest)}</${tag}>\n`;
      }
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
