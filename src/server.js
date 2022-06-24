import express from "express";
import webpack from "webpack";
import middleware from "webpack-dev-middleware";
import { configure } from "./configure";
import { mount } from "./api";

export function create(options) {
  const app = express();
  const webpack_config = configure(options);

  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  app.use(express.json());

  app.use(
    // Webpack devserver
    middleware(webpack(webpack_config), {
      // middleware options
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
