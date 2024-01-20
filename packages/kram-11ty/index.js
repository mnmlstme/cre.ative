const Kr = require("@cre.ative/kram");
const path = require("node:path");
const fs = require("fs");
const { render } = require("./render.js");
const defaultPlatform = require("./web-standard-plugin.js");

module.exports = {
  configure,
};

function configure(options = {}) {
  const {
    input = "./src",
    output = "./docs",
    platforms,
  } = options;
  const root = process.cwd();
  const inputRoot = path.resolve(root, input);
  const outputRoot = path.resolve(root, output);

  return {
    outputFileExtension: "html",
    compile: async function (inputContent, inputPath) {
      const basename = path.basename(inputPath, ".md");
      const relPath = path.relative(
        inputRoot,
        path.dirname(inputPath)
      );
      const projName = path.basename(path.dirname(inputPath));
      const context = path.resolve(
        outputRoot,
        relPath,
        basename
      );
      console.log(
        `[kram=11ty] Resolved path under ${outputRoot} through ${relPath} to ${basename}:`,
        context
      );
      const relOutputRoot = path.relative(context, outputRoot);
      console.log(
        `[kram=11ty] Relative path from ${context} to ${outputRoot}:`,
        relOutputRoot
      );

      console.log("Built-in highlighter:", this.highlight);

      return async (data) => {
        const {
          platform,
          runtime = "@cre.ative/kram-11ty/runtime",
        } = data;
        const styles = "@cre.ative/kram-11ty/styles";

        if (!platform) {
          return this.defaultRenderer(data);
        }
        console.log("[kram-11ty] Loading platform", platform);

        const plugin = Kr.register(
          platform === "none" || platform === "web-standard"
            ? defaultPlatform
            : require(platforms[platform])
        );

        console.log(
          "[kram-11ty] Highlighting with",
          this.highlight
        );

        const highlight =
          typeof this.highlight == "function"
            ? (s) => this.highlight(s)
            : (s) => s;

        const importMap = importPackages(
          [runtime, styles].concat(data.imports || []),
          path.resolve(root, "node_modules"),
          outputRoot,
          relOutputRoot
        );

        let workbook = Kr.parse(
          { body: inputContent, attributes: data },
          basename
        );
        workbook.project = projName;
        let files = [];
        const emitFile = emitter(".", context);
        const emitDependency = (name, code, language) => {
          // console.log("[kram] Emitting code:", name, code, language);
          const filename = emitFile(name, code);
          files.push({ name, code, language, filename });
          return filename;
        };
        workbook = Kr.classify(workbook, plugin.modules);
        workbook = Kr.dekram(workbook, emitDependency, plugin);

        const html = render(
          workbook.scenes,
          workbook.modules,
          importMap,
          {
            runtime,
            styles,
            ...data,
          }
        );

        return html;
      };
    },
  };
}

function importPackages(
  imports,
  nodeModules,
  moduleRoot,
  relModuleRoot
) {
  const entries = imports
    .map((spec) =>
      typeof spec === "object" ? spec.from : spec
    )
    .map((pkg) => [pkg, resolve(pkg)])
    .map(([pkg, file]) => [
      pkg,
      relocate(
        pkg,
        file,
        nodeModules,
        moduleRoot,
        relModuleRoot
      ),
    ]);

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

function relocate(
  pkg,
  src,
  nodeModules,
  outputRoot,
  relModuleRoot
) {
  const modulePrefix = "modules";
  const relpath = path.relative(nodeModules, src);
  const dest = path.join(outputRoot, modulePrefix, relpath);
  const result = path.join(
    relModuleRoot,
    modulePrefix,
    relpath
  );

  if (fs.existsSync(dest)) {
    // short-circuit the copy if it exists and is not older
    const mtime = (path) =>
      new Date(fs.statSync(path).mtime).getTime();

    if (mtime(src) <= mtime(dest)) {
      return result;
    }
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });

  fs.copyFile(
    src,
    dest,
    fs.constants.COPYFILE_FICLONE,
    (err) => {
      if (err) {
        console.log(
          `[ktam-11ty] WARNING: module ${pkg} will not be served (${err.code})`
        );
      } else {
        console.log(
          `[ktam-11ty] module ${pkg} will be served as "${result}"`
        );
      }
    }
  );

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
