import webpack from "webpack";
import Kr from "@cre.ative/kram";
import { packager } from "./webpack";

export async function publish(options) {
  const webpack = packager(options);

  return new Promise((resolve, reject) => resolve(webpack)).then((wp) =>
    wp.run((err, stats) => {
      if (err || stats.hasErrors()) {
        console.log("Publish FAILURE:", err || stats);
      } else {
        console.log("Publish SUCCESS:", stats);
      }
    })
  );
}
