const hash = require("object-hash");
const MarkdownIt = require("markdown-it");
const frontMatter = require("front-matter");
const { rules } = require("./render");

const defaultPlugin = {
  collate: function (workbook, lang) {
    const chunks = Kr.extract(workbook, lang)
    return chunks.map(t => t.text).join('\n')
  },
  classify: function (code, lang) {
    return "define"
  }
}

module.exports = {
  parse,
  defaultPlugin
};

const mdit = MarkdownIt('commonmark')

Object.assign(mdit.renderer.rules, rules)

function parse(md, basename, getPlugin ) {
  const { body, attributes } = frontMatter(md);
  const defaultLang = attributes.lang || "text"
  const tokens = mdit.parse(body)
  const unhandled = tokens.filter(t => t.type !== 'inline' && typeof rules[t.type] !== 'function')
  const json = `[{}${mdit.render(body)}]`

  if (unhandled.length > 0){
    console.log('Unhandled Tokens:', unhandled)
  }

  console.log('Rendered JSON:', json)

  const blocks = JSON.parse(json).slice(1)


  // lexer(body).map(function (token, index) {
  //   if (token.type === "code") {
  //     const assign = {
  //       id: `krumb-${index}`,
  //       lang: token.lang || defaultLang,
  //     };
  //     return Object.assign(token, assign);
  //   } else {
  //     return token;
  //   }
  // });

  const { title, platform, model, imports } = attributes;
  const plugin = getPlugin && getPlugin(platform) || defaultPlugin;

  let result = {
    title,
    basename,
    platform,
    languages: getLanguages(blocks),
    init: model,
    shape: getShapeOf(model),
    imports: getImportSpecs(imports),
    scenes: paginate(blocks)
      .map(scene => classify(scene, plugin.classify)),
  };

  const hashkey = hashcode(result);
  const moduleName = `Kram_${hashkey}_${basename}`;

  return Object.assign({ hashkey, moduleName }, result);
}

function paginate(blocks) {
  const isBreak = b =>
    Array.isArray(b) && b.length === 2 && b[0] === 'hr' && b[1].markup === '---'
  let breaks = blocks
    .map((b, i) => (isBreak(b) ? i : false))
    .filter((i) => i !== false);

  breaks.unshift(-1);

  return breaks.map((b, i) => blocks.slice(b + 1, breaks[i + 1]));
}

const defaultClassifier = (s) => ({mode: "define"})

function classify(scene, classifier = defaultClassifier) {
  const out = scene.map((b, i) => {
    // console.log('Classify:', b)
    const { type, id, lang, text } = b[0];

    if (type === "code") {
      return b.splice(0, 1, Object.assign({
        id,
        lang,
        code: text,
      }, classifier(text, lang)))
    } else {
      return b
    }
  });

  const headings = out.filter(b => b[0] === 'heading')
  console.log('Headings:', headings)

  return Object.assign({blocks: out}, headings.length ? {title: textContent(headings[0])} : {})
}

function textContent(t) {
  return typeof t === 'string' ? t :
    Array.isArray(t) ? t.slice(1).map(s => textContent(s)).join('') : ''
}

function getLanguages(tokens) {
  return tokens
    .filter((t) => t.type === "code")
    .map((t) => t.lang)
    .reduce(
      (accum, next) => (accum.includes(next) ? accum : accum.concat([next])),
      []
    );
}

function getImportSpecs(imports) {
  switch (getTypeOf(imports)) {
    case "array":
      return imports.map(importSpec);
    case "record":
      return Object.entries(imports || {}).map(([k, v]) => importSpec(k, v));
    case "string":
      return [importSpec(imports)];
    default:
      return [];
  }
}

function importSpec(pkg, spec) {
  switch (getTypeOf(spec)) {
    case "record":
      return Object.assign(spec, { as: pkg });
    case "string":
      return { from: spec, as: pkg };
    default:
      return { from: pkg, as: pkg };
  }
}

function getShapeOf(model) {
  const type = getTypeOf(model);

  switch (type) {
    case "array":
      return { [type]: getShapeOf(model[1]) };
    case "record":
      fields = Object.entries(model).map(([k, v]) => [k, getShapeOf(v)]);
      return { [type]: Object.fromEntries(fields) };
    default:
      return type;
  }
}

function getTypeOf(value) {
  const type = typeof value;

  switch (type) {
    case "object":
      return Array.isArray(value) ? "array" : "record";
    case "number":
      return Number.isInteger(value) ? "int" : "float";
    default:
      return type;
  }
}

function hashcode({ platform, imports, shape, scenes }, lang) {
  const code = scenes.map((scn) => scn.code);
  const views = scenes.map((scn) => scn.view || {});

  return hash({ platform, imports, shape, code, views }).substr(-8);
}
