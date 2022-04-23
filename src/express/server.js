const express = require('express')
const { mount } = require('./api')

function create(config) {
  const app = express()

  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  app.use(express.json())

  const store = Object.assign(
    {
      projectDir: './projects',
    },
    config
  )

  mount(app, store)

  return app
}

function start(app, port = 3000) {
  app.listen(port, () =>
    console.log(`Kram server listening at http://localhost:${port}`)
  )
}

module.exports = { create, start }
