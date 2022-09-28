import express from "express";
import devServer from "webpack-dev-middleware";
import hmrServer from "webpack-hot-middleware";
import { mount } from "./api";
import { packager } from "./webpack";

export async function create(options) {
  const app = express();
  const compiler = await packager(options);

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

export function start(app, port = 3000) {
  app.listen(port, () =>
    console.log(`Kram server listening at http://localhost:${port}`)
  );
}
