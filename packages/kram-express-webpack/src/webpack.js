import webpack from "webpack";
import Kr from "@cre.ative/kram";
import { configure } from "./configure";
import webStandard from "./web-standard-plugin";

export async function packager(options) {
  const { platforms } = options;

  const defaultPlugin = Kr.register(webStandard);
  const plugins = platforms ? await registerPlugins(platforms) : [];
  const webpack_config = configure({
    plugins: [defaultPlugin, ...plugins],
    ...options,
  });
  console.log("Webpack Configuration:", jsonpp(webpack_config));

  return webpack(webpack_config);
}

async function registerPlugins(platforms) {
  const allPlatforms = Object.entries(platforms).map(([name, moduleName]) =>
    import(/* webpackIgnore: true */ moduleName)
      .then((mod) => Kr.register(mod.default, name))
      .catch((err) =>
        console.log("Failed to load Kram plugin:", name, moduleName, err)
      )
  );

  return Promise.allSettled(allPlatforms).then((results) =>
    results.filter((r) => r.status === "fulfilled").map((r) => r.value)
  );
}

function jsonpp(obj) {
  const replacer = (_, s) => {
    if (typeof s === "function") {
      return { "[Function]": s.displayName || s.name };
    } else if (s instanceof RegExp) {
      return { "[RegExp]": s.source };
    } else {
      return s;
    }
  };

  return JSON.stringify(obj, replacer, "  ");
}
