import express from 'express'
import workbook from './workbook'

export function serve(store, port = 3000) {
  const app = express()

  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  app.use('/app', express.static('dist'))
  app.use(express.json())

  app.get('/', function (req, res) {
    res.redirect('/app')
  })

  //  app.get('/api/projects', project.list)
  //  app.get('/api/projects/:id', project.getById)
  //  app.post('/api/projects', project.create)
  //  app.put('/api/projects/:id', project.update)

  app.get('/api/projects/:prjId/workbooks/:wbkId', (req, res) =>
    workbook.getById(store, req, res)
  )
  //  app.post('/api/projects/:prjId/workbooks', workbook.create)
  app.put('/api/projects/:prjId/workbooks/:wbkId', (req, res) =>
    workbook.update(store, req, res)
  )
  app.put('/api/projects/:prjId/workbooks/:wbkId/scenes/:scnId', (req, res) =>
    workbook.updateScene(store, req, res)
  )

  app.listen(port, () =>
    console.log(`Kram server listening at http://localhost:${port}`)
  )
}

export default { serve }
