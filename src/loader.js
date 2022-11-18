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
  const projpath = path.dirname(relpath);
  const projname = path.basename(projpath);

  const callback = this.async();

  const workbook = Kr.parse(content, basename);
  const platform = workbook.platform || "web-standard";
  const plugin = platforms[platform] || Kr.defaultPlugin;
  const dir = path.join(platform, projname, basename);

  console.log("Kram loader, using plugin:", platform, projname, basename);

  return new Promise((resolve, reject) =>
    resolve({ project: projname, ...workbook })
  )
    .then((wb) => Kr.classify(wb, plugin.modules))
    .then((wb) => Kr.dekram(wb, emitter(dir, output), plugin))
    .then((wb) => Kr.collect(wb))
    .then((mod) => callback(null, mod))
    .catch(callback);

  function emitter(reldir, output = "") {
    const absdir = path.join(output, reldir);

    return (name, code) => {
      const relname = path.join(reldir, name);
      const absname = path.join(absdir, name);

      fs.mkdirSync(absdir, { recursive: true });
      fs.writeFileSync(absname, code);

      console.log(`Kram emit: ${relname} -> `, absname);
      return relname;
    };
  }
}
