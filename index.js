const Kr = require("@cre.ative/kram");
const he = require("he");
const path = require("node:path");
const webStandard = require("./web-standard-plugin");

module.exports = {
  configure,
};

function configure() {
  const options = {
    platforms: {
      "web-standard": Kr.register(webStandard),
    },
    defaultPlatform: "web-standard",
  };

  return {
    outputFileExtension: "html",
    compile: async function (inputContent, inputPath) {
      const workbook = parse(inputContent, inputPath);

      return async (data) => {
        return render(workbook, data, options);
      };
    },
  };
}

function parse(inputContent, inputPath) {
  const basename = path.basename(inputPath, ".md");
  const projname = path.dirname(inputPath);
  return Kr.parse(inputContent, basename);
}

function render(wb, data, options) {
  const { platforms, defaultPlatform } = options;
  const { platform = defaultPlatform } = data;
  const plugin = platforms[platform] || {};
  let files = {};

  wb = Kr.classify(wb, plugin.modules);
  wb = Kr.dekram(wb, emitter, plugin);

  return genHtml(wb, data, files);

  function emitter(name, code) {
    files[name] = code;
    return name;
  }
}

function genHtml(wb, data, files) {
  const { moduleName, basename, scenes, modules, plugin } = wb;
  const { title, model } = data;

  return `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<link rel="stylesheet" href="/_styles/theme.css" webc:keep>
<link rel="stylesheet" href="./styles.css" webc:keep>
${genCSSDefs(modules, files)}
<script type="module" src="./script.js" webc:keep></script>
${genJSDefs(modules, files)}
</head>
<body>
${genHTMLDefs(modules, files)}
${genSVGDefs(modules, files)}
<st-ative>
<navig-ative>
<span slot="title">${title}</title>
</navig-ative>
<consolid-ative>
${genScenes(scenes, modules, files)}
</consolid-ative>
</st-ative>

<script type="module" webc:keep>
import { mount } from "/_scripts/oper.ative.js";
console.log("Mounting Operative");
const mountpoint = document.getElementById("lets-be-oper-ative");
const initial = ${JSON.stringify(model)};
mount("${moduleName}", mountpoint, initial);
</script>
</body>
</html>
`;
}

function genCSSDefs(modules, files) {
  const blocks = modules
    .filter((mdl) => mdl && mdl.language === "css")
    .map((mdl) => files[mdl.filepath]);

  return blocks.map((blk) => `<style>${blk}</style>`).join("\n");
}

function genJSDefs(modules, files) {
  const blocks = modules
    .filter((mdl) => mdl && mdl.language === "js")
    .map((mdl) => files[mdl.filepath]);

  return blocks
    .map((blk) => `<script type="module">${blk}</script>`)
    .join("\n");
}

function genHTMLDefs(modules, files) {
  const blocks = modules
    .filter((mdl) => mdl && mdl.language === "html" && mdl.mode === "define")
    .map((mdl) => files[mdl.filepath])
    .map((code) =>
      code.replaceAll(/<\s*template(\s+[^>]*)?>/gi, "<template webc:raw$1>")
    );

  return blocks.join("\n");
}

function genSVGDefs(modules, files) {
  const blocks = modules
    .filter((mdl) => mdl && mdl.language === "svg" && mdl.mode === "define")
    .map((mdl) => files[mdl.filepath]);

  return blocks.join("\n");
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
    const code = blocks
      .filter(isEvalBlock)
      .map(
        ([_, { lang }, ...rest]) =>
          `<code lang="${lang}">${encodeAsHtml(rest.join("\n"))}</code>`
      )
      .join("\n");

    return [
      `<oper-ative>${file}</oper-ative>`,
      `<narr-ative>${prose}</narr-ative>`,
      `<ide-ative>${code}</ide-ative>`,
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

  switch (type) {
    case "fence":
      return `<figure><figcaption>${lang}</figcaption><pre lang="${lang}"><code>${encodeAsHtml(
        rest.join("\n")
      )}</code></pre></figure>\n`;
    case "bullet_list":
    case "ordered_list":
    case "list_item":
      return `<${tag}>${genProse(rest)}</${tag}>\n`;
    default:
      return `<${tag}>${jsonToHtml(rest)}</${tag}>\n`;
  }
}

function jsonToHtml(tokens) {
  return tokens
    .map((t) => (typeof t === "string" ? encodeAsHtml(t) : tokenToHtml(t)))
    .join("");
}

function encodeAsHtml(text) {
  return he.encode(text, {
    useNamedReferences: true,
    decimal: true,
  });
}

function tokenToHtml([type, attrs, ...children]) {
  const { tag, block, markup, href } = attrs;
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
