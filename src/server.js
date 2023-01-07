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

  if (options.dev) {
    app.use(
      // Webpack devserver
      devServer(compiler, {
        // middleware options
      })
    );
  }

  if (options.dev === "hmr") {
    app.use(
      // Webpack HMR devserver
      hmrServer(compiler, {
        // middleware options
        log: console.log,
        path: "/__webpack_hmr",
        heartbeat: 10 * 1000,
      })
    );
  }

  if (!options.quiet) {
    app.use(requestLogger);
  }

  if (options.api) {
    app.use(express.json());
  }

  if (options.serve) {
    console.log("Serving compiled assets from ", options.public);
    app.use("/dist", express.static(options.public));
  }

  app.use("/workbook", express.static(options.public));

  const store = {
    projectDir: "./projects",
    kramDir: "./kram_modules",
    ...options,
  };

  mount(app, store);

  return app;
}

function requestLogger(req, res, next) {
  console.log("kram-express-webpack:", [req.method, req.path].join(" "));
  next();
}

export function start(app, port = 3000) {
  app.listen(port, () =>
    console.log(`Kram server listening at http://localhost:${port}`)
  );
}
