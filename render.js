const he = require("he");
const Kr = require("@cre.ative/kram");

module.exports = { render };

function render(wb, data, plugin, emitDependency) {
  let files = {};

  wb = Kr.classify(wb, plugin.modules);
  wb = Kr.dekram(wb, emitter, plugin);

  return genHtml(wb, data, files);

  function emitter(name, code, language) {
    console.log("[kram-11ty] emit:", name);
    files[name] = code;
    emitDependency(name, code, language);
    return name;
  }
}

function genHtml(wb, data, files) {
  const { basename, scenes, modules = [] } = wb;
  const { title, model } = data;
  const namedModules = modules.filter((mdl) => Boolean(mdl.moduleName));
  console.log(
    "Generating Html",
    modules.map((m) => m.moduleName).join(","),
    Object.keys(files).join(",")
  );

  return `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<link rel="stylesheet" href="/styles/theme.css" webc:keep>
</head>
<body webc:bucket="defer">
<kram-main>
<kram-nav>
<span slot="title">${title}</title>
</kram-nav>
<kram-flow>
${genScenes(scenes, modules, files)}
</kram-flow>
</kram-main>
<script type="module" webc:keep>
import Wb from "./workbook.js";
console.log("Workbook loaded; ready to mount!", wb);
</script>
</body>
</html>
`;
}

function genScenes(scenes, modules, files) {
  const filesByScene = Object.fromEntries(
    modules
      .filter((mdl) => mdl.scene)
      .map(({ scene, filepath }) => [scene, files[filepath]])
  );
  const sceneBlocks = scenes.map(({ blocks }, i) => {
    const file = filesByScene[i + 1] || [];
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

    return [
      `<kram-scene>${file}</kram-scene>`,
      `<kram-code data-language="auto">${evalcode}</kram-code>`,
      `<kram-narrative>${prose}</kram-narrative>`,
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
