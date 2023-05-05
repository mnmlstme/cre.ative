const Kr = require("@cre.ative/kram");
const path = require("node:path");
const fs = require("fs");
const { render } = require("./render.js");
const defaultPlatform = require("./web-standard-plugin.js");

module.exports = {
  configure,
};

function configure(options = {}) {
  const { input = "./src", output = "./docs", template, platforms } = options;
  const root = process.cwd();
  const inputRoot = path.resolve(root, input);
  const outputRoot = path.resolve(root, output);

  return {
    outputFileExtension: "html",
    compile: async function (inputContent, inputPath) {
      const basename = path.basename(inputPath, ".md");
      const relPath = path.relative(inputRoot, path.dirname(inputPath));
      const projName = path.basename(path.dirname(inputPath));
      const context = path.resolve(outputRoot, relPath, basename);

      return async (data) => {
        const { platform, runtime = "@cre.ative/kram-11ty/runtime" } = data;

        if (!platform) {
          return this.defaultRenderer(data);
        }

        const plugin = Kr.register(
          platform === "none" || platform === "web-standard"
            ? defaultPlatform
            : require(platforms[platform])
        );

        const importMap = importPackages(
          [runtime].concat(data.imports || []),
          path.resolve(root, "node_modules"),
          outputRoot
        );

        let workbook = Kr.parse(
          { body: inputContent, attributes: data },
          basename
        );
        workbook.project = projName;
        let files = [];
        const emitFile = emitter(".", context);
        const emitDependency = (name, code, language) => {
          const filename = emitFile(name, code);
          files.push({ name, code, language, filename });
          return filename;
        };
        workbook = Kr.classify(workbook, plugin.modules);
        workbook = Kr.dekram(workbook, emitDependency, plugin);

        const html = render(workbook.scenes, workbook.modules, importMap, {
          runtime,
          ...data,
        });

        return html;
      };
    },
  };
}

function importPackages(imports, nodeModules, moduleRoot) {
  const entries = imports
    .map((spec) => (typeof spec === "object" ? spec.from : spec))
    .map((pkg) => [pkg, resolve(pkg)])
    .map(([pkg, file]) => [pkg, relocate(pkg, file, nodeModules, moduleRoot)]);

  return Object.fromEntries(entries);
}

function resolve(pkg) {
  let path = pkg;

  try {
    path = require.resolve(pkg);
  } catch (err) {
    console.log(
      `[kram-11ty] WARNING: Failed to resolve package "${pkg}" for import at runtime (${err.code})`
    );
  }

  return path;
}

function relocate(pkg, src, nodeModules, outputRoot) {
  const modulePrefix = "modules";
  const relpath = path.relative(nodeModules, src);
  const dest = path.join(outputRoot, modulePrefix, relpath);
  const result = path.join("/", modulePrefix, relpath);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // might want to check first if the file exists and is not old
  fs.copyFile(src, dest, fs.constants.COPYFILE_FICLONE, (err) => {
    if (err) {
      console.log(
        `[ktam-11ty] WARNING: module ${pkg} will not be served (${err.code})`
      );
    } else {
      console.log(`[ktam-11ty] module ${pkg} will be served as "${result}"`);
    }
  });

  return result;
}

function emitter(reldir, output = "") {
  const absdir = path.join(output, reldir);

  return (name, code) => {
    const absname = path.join(absdir, name);
    const relname = `./${path.relative(output, absname)}`;

    fs.mkdirSync(absdir, { recursive: true });
    fs.writeFileSync(absname, code);

    console.log(`[kram-11ty] ${relname} -> `, absname);
    return relname;
  };
}
