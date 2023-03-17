const Kr = require("@cre.ative/kram");
const he = require("he");
const path = require("node:path");
const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");
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
        if (data.platform === "none") {
          return this.defaultRenderer(data);
        } else {
          return render(workbook, data, options);
        }
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
  const { basename, scenes, modules = [], plugin } = wb;
  const { title, model } = data;
  const namedModules = modules.filter((mdl) => Boolean(mdl.moduleName));
  const mountScript = namedModules.length
    ? `
import { mount } from "/_scripts/oper.ative.js";
console.log("Mounting Operative");
const mountpoint = document.getElementById("lets-be-oper-ative");
const initial = ${JSON.stringify(model)};
const moduleNames = ${JSON.stringify(
        namedModules.map((mdl) => mdl.moduleName)
      )};
moduleNames.forEach((name) => mount(name, mountpoint, initial));
`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<link rel="stylesheet" href="/_styles/prism.css" webc:keep>
<link rel="stylesheet" href="/_styles/theme.css" webc:keep>
${genCSSDefs(modules, files)}
${genJSDefs(modules, files)}
</head>
<body webc:bucket="defer">
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
${mountScript}
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
    const evalcode = blocks
      .filter(isEvalBlock)
      .map(([_, { lang }, ...rest]) => {
        const code = rest.join("\n");
        const formatted = Prism.highlight(code, Prism.languages[lang], lang);
        return `<code lang="${lang}" class="language-${lang}">${formatted}</code>`;
      })
      .join("\n");

    return [
      `<oper-ative>${file}</oper-ative>`,
      `<ide-ative data-language="auto">${evalcode}</ide-ative>`,
      `<narr-ative>${prose}</narr-ative>`,
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
      const formatted = Prism.highlight(code, Prism.languages[lang], lang);
      return `<ide-ative data-language="${lang}"><code class="language-${lang}">${formatted}</code></ide-ative>`;
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
