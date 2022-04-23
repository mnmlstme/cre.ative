import express from 'express'
import webpack from 'webpack'
import middleware from 'webpack-dev-middleware'
const { server } = require('kram/src/express')
import { configure } from './configure'
const path = require('path')

const PORT = 3000

export function create(options) {
  const { approot } = options
  const config = configure(options)
  const app = server.create()
  const compiler = webpack(config)
  const htmlfile = path.join(approot, 'index.html');
  
  app.use(['/app', '/app/*'], function(req, res, next) {
    // all routes send the same HTML
    res.sendFile(htmlfile)
  })

  app.get('/', function (req, res) {
    res.redirect('/app')
  })

  app.use(
    middleware(compiler, {
      // devserver options
    })
  )

  return app
}

export function start(app, port = PORT) {
  server.start(app, port)
}
