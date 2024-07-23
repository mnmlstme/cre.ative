const kram11ty = require("@cre.ative/kram-11ty");
const vitePlugin = require("@11ty/eleventy-plugin-vite");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const loadLanguages = require('prismjs/components/');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/scripts": "scripts",
    "src/styles": "styles",
  });
  eleventyConfig.addPassthroughCopy("projects/**/FILES/*.*");

  eleventyConfig.addPlugin(vitePlugin, {
    viteOptions: {
      mode: "development",
      build: {
        minify: false,
        target: "esnext",
      },
    },
  });

  eleventyConfig.addPlugin(syntaxHighlight, {
    init: ({Prism}) => {
      // loadLanguages(["js", "ts", "html", "svg", "js-templates", "css", "elm"]);
      console.log("Prism:", Object.keys(Prism));
      console.log("Version:", Prism.version)
    }
  });

  // Override Markdown parser to Kram
  eleventyConfig.addExtension(
    "md",
    kram11ty.configure({
      input: "./workbooks",
      output: "./docs",
      template: "./src/template/post.html",
      platforms: {
        "react-redux": "@cre.ative/kram-react-redux",
        elm: "@cre.ative/kram-elm",
        typescript: "@cre.ative/kram-typescript",
      },
    })
  );

  return {
    dir: {
      input: "workbooks/",
      output: "docs",
    },
  };
};
