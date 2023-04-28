const Kr = require("@cre.ative/kram");
const path = require("node:path");
const { open } = require("node:fs/promises");
const Kwp = require("@cre.ative/kram-express-webpack");
const { render } = require("./render.js");

module.exports = {
  configure,
};

function configure(options = {}) {
  const { input = "./src", output = "./docs", template, platforms } = options;
  const basedir = process.cwd();
  const inputRoot = path.resolve(basedir, input);
  const outputRoot = path.resolve(basedir, output);

  const config = {
    basedir,
    docroot: inputRoot,
    public: outputRoot,
    ...options,
  };

  return {
    outputFileExtension: "html",
    compile: async function (inputContent, inputPath) {
      const basename = path.basename(inputPath, ".md");
      const relPath = path.relative(inputRoot, path.dirname(inputPath));
      const webpack = await Kwp.packager({
        entry: {
          workbook: {
            import: inputPath,
            filename: path.join(relPath, basename, "workbook.js"),
          },
        },
        ...config,
      });

      return async (data) => {
        if (data.platform === "none") {
          return this.defaultRenderer(data);
        } else {
          const plugin = Kr.register(require(platforms[data.platform]));
          const workbook = Kr.parse(
            { body: inputContent, attributes: data },
            basename
          );
          const html = render(workbook, data, plugin);

          return await new Promise((resolve, reject) => {
            webpack.run((err, stats) => {
              if (err) {
                reject(err);
                return;
              }

              resolve(html);

              if (stats.hasErrors()) {
                const info = stats.toJson();
                console.error(
                  `[kram] ERROR (webpack) ${inputPath}\n`,
                  info.errors
                    .map((e) => `[kram] E      ${e.message}`)
                    .join("\n")
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
