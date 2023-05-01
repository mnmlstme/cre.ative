const he = require("he");
const Kr = require("@cre.ative/kram");
const path = require("node:path");

module.exports = { render };

function render(scenes, data, entries) {
  const { title, model } = data;

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
${genScenes(scenes)}
</kram-flow>
</kram-main>
<script type="module" webc:keep>
${genModuleImports(entries, model)}
</script>
</body>
</html>
`;
}

function genModuleImports(entries, model) {
  console.log("Modules:", JSON.stringify(entries));
  const mpt = "kram-mountpoint";
  const mfn = "mount";
  const dynamicImports = Object.values(entries)
    .map(
      (m) =>
        `import("./${m.filename}").then((mod) => ${mfn}(mod, "${m.import}", "${mpt}"));`
    )
    .join("\n");

  return `
    const initialState = ${JSON.stringify(model)};
    ${dynamicImports}
    function ${mfn} (mod, name, mountpoint) {
      let render = (n, container) => {
        console.log("Cannot render scene; module not mounted:", name);
      };

      try {
        const mountElement = document.getElementById(mountpoint);
        render = mod.mount(mountElement, initialState);
        console.log("Module mounted:", name);
      } catch (err) {
        console.log("Warning: module not mounted", name, err);
      }

      return render;
    }`;
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

    return [
      `<kram-scene scene="${i}"></kram-scene>`,
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
