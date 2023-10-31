import express from "express";
import devServer from "webpack-dev-middleware";
import hmrServer from "webpack-hot-middleware";
import { mount } from "./api";
import { packager } from "./webpack";
const path = require("path");

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
    app.use("/", express.static(options.public));
    // workbook is a SPA so we need to ignore the tail of the URL:
    app.use("/workbook/:projId/:wbId/*", function (request, response) {
      const { projId, wbId } = request.params;
      response.sendFile(
        path.resolve(options.public, "workbook", projId, wbId, "index.html")
      );
    });
  }

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
