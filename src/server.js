import express from "express";
import webpack from "webpack";
import devServer from "webpack-dev-middleware";
import hmrServer from "webpack-hot-middleware";
import { configure } from "./configure";
import { mount } from "./api";

export function create(options) {
  const app = express();
  const webpack_config = configure(options);
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

  const store = Object.assign(
    {
      projectDir: "./projects",
      kramDir: "./kram_modules",
    },
    options
  );

  mount(app, store);

  return app;
}

export function start(app, port = 3000) {
  app.listen(port, () =>
    console.log(`Kram server listening at http://localhost:${port}`)
  );
}
