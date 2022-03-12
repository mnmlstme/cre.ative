import express from 'express'
import { create as kram_server, start as kram_start } from 'kram/src/express'

export function create() {
  const app = kram_server()

  app.use('/app', express.static('dist'))

  app.get('/', function (req, res) {
    res.redirect('/app')
  })
}

export const start = kram_start
