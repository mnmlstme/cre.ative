const path = require("path");
const fs = require("fs");
const Kr = require("@cre.ative/kram");

const kramExt = (id) => `${id}.md`;

function asyncParse(filepath, basename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const workbook = Kr.parse(data, basename);
          resolve(workbook);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

function getById(store, req, res) {
  const { prjId, wbkId } = req.params;
  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));

  asyncParse(filepath, wbkId)
    .then((workbook = res.status(200).json(workbook)))
    .catch((error) => res.status(500).send(error));
}

function update(store, req, res) {
  const { prjId, wbkId } = req.params;
  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));
  const wb = req.body;

  fs.writeFile(filepath, Kr.pack(wb), (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send();
    }
  });
}

function updateScene(store, req, res) {
  const { prjId, wbkId, scnId } = req.params;
  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));
  const json = req.body;

  fs.readFile(filepath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      let wb = Kr.parse(data, wbkId, (wb) => {
        const scenes = wb.scenes;
        scenes[scnId] = json;
        return Object.assign({}, wb, { scenes });
      });

      fs.writeFile(filepath, Kr.pack(wb), (err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json({
            moduleName: wb.moduleName,
            scenes: { [scnId]: wb.scenes[scnId] },
            modules: wb.modules,
          });
        }
      });
    }
  });
}

module.exports = {
  getById,
  update,
  updateScene,
};
