const path = require('path')
const fs = require('fs')
const Kr = require('../')

const kramExt = (id) => `${id}.kr`

function getById(store, req, res) {
  const { prjId, wbkId } = req.params
  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId))

  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.json(Kr.parse(data, wbkId))
    }
  })
}

function update(store, req, res) {
  const { prjId, wbkId } = req.params
  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId))
  const wb = req.body

  fs.writeFile(filepath, Kr.pack(wb), (err) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send()
    }
  })
}

function updateScene(store, req, res) {
  const { prjId, wbkId, scnId } = req.params
  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId))
  const json = req.body

  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      let wb = Kr.parse(data, wbkId)
      wb.scenes[scnId] = json
      fs.writeFile(filepath, Kr.pack(wb), (err) => {
        if (err) {
          res.status(500).send(err)
        } else {
          res.status(200).json(wb.scenes[scnId])
        }
      })
    }
  })
}

module.exports = {
  getById,
  update,
  updateScene
}
