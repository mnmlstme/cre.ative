import kram11ty from "@cre.ative/kram-11ty";
import vitePlugin from "@11ty/eleventy-plugin-vite";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
// import "prismjs/components/prism-scala.js";
import elmPlugin from "vite-plugin-elm";

export default function (eleventyConfig) {
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
      plugins: [elmPlugin()],
    },
  });

  eleventyConfig.addPlugin(syntaxHighlight, {
    init: ({ Prism }) => {
      // loadLanguages(["js", "ts", "html", "svg", "js-templates", "css", "elm"]);
      console.log(
        "Prism languages:",
        Object.keys(Prism.languages)
      );
      console.log("Version:", Prism.version);
    },
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
}
