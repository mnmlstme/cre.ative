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
  const platform = workbook.platform || "web";
  const dir = path.join(platform, projname, basename);
  const outdir = output ? path.join(output, dir) : dir;

  const requirePlugin = new Promise((resolve, reject) => {
    const moduleSpecifier = platforms[platform] || platform;

    if (moduleSpecifier === "web") {
      resolve(Kr.defaultPlugin);
    }

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

  const epilog = ""; //if (module.hot) { module.hot.accept() }";

  requirePlugin
    .then((plugin) => [plugin, Kr.classify(workbook, plugin.modules)])
    .then(([plugin, wb]) => Kr.dekram(wb, emitter(outdir), plugin))
    .then((wb) => Kr.collect(wb, loadFn, epilog))
    .then((module) => callback(null, module))
    .catch(callback);

  const loadResolver = (loader) =>
    new Promise((resolve, reject) => {
      this.resolve(this.rootContext, loader, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(path.relative(root, result));
        }
      });
    });

  function loadFn({ filepath, use }) {
    const targetPath = path.relative(projpath, filepath);
    const target = use ? `${use}!${targetPath}` : targetPath;

    loadResolver(use).then((resolvedLoader) =>
      console.log("loader resolved:", use, resolvedLoader)
    );
    console.log("waiting for loader resolution");

    // HMR needs the loader resolved
    const resolvedUsing =
      use &&
      use.replace(/^css-loader/, "./node_modules/css-loader/dist/cjs.js");

    const acceptPath = path.relative(root, filepath);
    const accept = use ? `${resolvedUsing}!./${acceptPath}` : `./{acceptPath}`;

    return `function ( onHotSwap ) { 
      const target = '${accept}';
      const enableHMR = (mod) => {
        if (module.hot) {
          if (onHotSwap) { 
            module.hot.accept(target, onHotSwap);
            console.log('Enabled Hot-Swap on module:', target, mod);
          } else {
            console.log('Hot-Swap available but declined for module:', target);
            module.hot.decline(target)
          }
        }
        return mod;
      }
      return import( /* webpackMode: "lazy" */ '${target}' )
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
