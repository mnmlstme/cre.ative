import express from 'express'
import {mount} from './api'

const store = {
  prjDir: './workbooks',
}

export function create() {
  const app = express()

  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  app.use(express.json())

  mount(app, store)

  return app
}

export function start(app, port =3000) {
  app.listen(port, () =>
    console.log(`Kram server listening at http://localhost:${port}`)
  )
}
