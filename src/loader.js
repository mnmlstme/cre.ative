const { getOptions } = require("loader-utils");
const fs = require("fs");
const path = require("path");
const Kr = require("@cre.ative/kram");
const { asyncParse } = require("./workbook");

module.exports = loader;

function loader(content) {
  const options = getOptions(this) || {};
  const { defaults = {}, root = this.rootContext, output, platforms } = options;
  const relpath = path.relative(root, this.resourcePath);
  const basename = path.basename(relpath, ".md");
  const projname = path.dirname(relpath);

  const callback = this.async();

  const workbook = Kr.parse(content, basename);
  const platform = workbook.platform;
  const dir = path.join(platform, projname, basename);
  const outdir = output ? path.join(output, dir) : dir;

  const requirePlugin = new Promise((resolve, reject) => {
    const moduleSpecifier = platforms[platform] || platform;

    this.resolve(this.rootContext, moduleSpecifier, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const plugin = Kr.register(require(result), platform);
        // console.log("kram plugin loaded:", platform, plugin);
        resolve(plugin);
      }
    });
  });

  requirePlugin
    .then((plugin) => [plugin, Kr.classify(workbook, plugin.modules)])
    .then(([plugin, wb]) => Kr.dekram(wb, emitter(outdir), plugin))
    .then((wb) => Kr.collect(wb, loadFn))
    .then((module) => callback(null, module))
    .catch(callback);
}

function loadFn(path, using) {
  const target = using ? `!${using}!${path}` : path;

  return `function () { 
    return import(
      /* webpackMode: "lazy" */ 
      '${target}'
    )
  }`;
}

function emitter(outdir) {
  return (name, code) => {
    const filename = path.join(outdir, name);

    fs.mkdirSync(outdir, { recursive: true });
    fs.writeFileSync(filename, code);

    // console.log("Kram emit", filename);
    return filename;
  };
}
