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
  const outdir = output ? path.join(output, dir) : dir;

  const epilog = ""; //if (module.hot) { module.hot.decline() }";

  console.log("Kram loader, using plugin:", platform, projname, basename);

  return new Promise((resolve, reject) =>
    resolve({ project: projname, ...workbook })
  )
    .then((wb) => Kr.classify(wb, plugin.modules))
    .then((wb) => Kr.dekram(wb, emitter(outdir), plugin))
    .then((wb) => Kr.collect(wb, loadFn, epilog))
    .then((mod) => callback(null, mod))
    .catch(callback);

  function loadFn({ filepath }) {
    const targetPath = path.relative(projpath, filepath);
    const acceptPath = path.relative(root, filepath);

    return `function ( onHotSwap ) { 
      const accept = './${acceptPath}';
      const enableHMR = (mod) => {
        if (module.hot) {
          if (onHotSwap) { 
            module.hot.accept(accept, onHotSwap);
            console.log('Enabled Hot-Swap on module:', accept, mod);
          } else {
            console.log('Hot-Swap available but declined for module:', accept);
            module.hot.decline(accept)
          }
        }
        return mod;
      }
      return import( /* webpackMode: "lazy" */ '${targetPath}' )
        .then(enableHMR)
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
}
