import express from "express";
import webpack from "webpack";
import devServer from "webpack-dev-middleware";
import hmrServer from "webpack-hot-middleware";
import Kr from "@cre.ative/kram";
import { configure } from "./configure";
import { mount } from "./api";

export async function create(options) {
  const { platforms } = options;
  const app = express();
  const plugins = platforms ? await registerPlugins(platforms) : [];
  const webpack_config = configure({ plugins, ...options });
  console.log("Webpack Configuration:", jsonpp(webpack_config));

  const compiler = webpack(webpack_config);

  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  app.use(express.json());

  app.use(
    // Webpack devserver
    devServer(compiler, {
      // middleware options
    })
  );

  app.use(
    // Webpack HMR devserver
    hmrServer(compiler, {
      // middleware options
      log: console.log,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000,
    })
  );

  const store = {
    projectDir: "./projects",
    kramDir: "./kram_modules",
    ...options,
  };

  mount(app, store);

  return app;
}

async function registerPlugins(platforms) {
  const allPlatforms = Object.entries(platforms).map(([name, moduleName]) =>
    import(/* webpackIgnore: true */ moduleName)
      .then((mod) => Kr.register(mod.default, name))
      .catch((err) => console.log("Failed to load Kram plugin:", name, err))
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

export function start(app, port = 3000) {
  app.listen(port, () =>
    console.log(`Kram server listening at http://localhost:${port}`)
  );
}
