const Kr = require("@cre.ative/kram");
const path = require("node:path");
const { open } = require("node:fs/promises");
const fs = require("fs");
const webpack = require("webpack");
const { render } = require("./render.js");

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

      const baseconfig = {
        name: `kram-11ty-${projName}-${basename}`,
        context,
        experiments: { outputModule: true },
        output: {
          module: true,
          chunkFilename: "chunk.[id].mjs",
          chunkFormat: "module",
          path: context,
        },
        mode: "production",
      };

      return async (data) => {
        const platform = data.platform;

        if (!platform || platform === "none") {
          return this.defaultRenderer(data);
        }

        const plugin = Kr.register(require(platforms[platform]));
        let workbook = Kr.parse(
          { body: inputContent, attributes: data },
          basename
        );
        workbook.project = projName;
        let entries = {}; // webpack entry point descriptors
        const emitFile = emitter(".", context);
        const emitDependency = (name, code, language) => {
          const srcfile = emitFile(name, code);
          entries[language] = {
            import: srcfile,
            filename: path.join("modules", `${srcfile}.module.js`),
          };
          return srcfile;
        };
        workbook = Kr.classify(workbook, plugin.modules);
        workbook = Kr.dekram(workbook, emitDependency, plugin);

        const html = render(workbook.scenes, data, entries);

        const webpack_config = {
          entry: entries,
          module: {
            rules: kramRules(plugin, context),
          },
          ...baseconfig,
        };
        console.log(
          "Webpack configuration:",
          JSON.stringify(webpack_config, 2)
        );
        const compiler = webpack(webpack_config);

        return await new Promise((resolve, reject) => {
          compiler.run((err, stats) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(html);

            if (stats.hasErrors()) {
              const info = stats.toJson();
              console.error(
                `[kram] ERROR (webpack) ${inputPath}\n`,
                info.errors.map((e) => `[kram] E      ${e.message}`).join("\n")
              );
            }

            if (stats.hasWarnings()) {
              const info = stats.toJson();
              console.warn(
                `[kram] WARNING (webpack) ${inputPath}\n`,
                info.warnings
                  .map((w) => `[kram] W      ${w.message}`)
                  .join("\n")
              );
            }
          });
        });
      };
    },
  };
}

function parse(inputContent, inputPath) {
  const basename = path.basename(inputPath, ".md");
  const projname = path.dirname(inputPath);
  return Kr.parse(inputContent, basename);
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

function kramRules(plugin, context) {
  const platform = plugin.name;
  return plugin.modules.map(({ language, use }) => {
    return {
      test: RegExp(`\.${language}\$`),
      include: [context],
      use: use(),
    };
  });
}
