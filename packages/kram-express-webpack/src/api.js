const workbook = require("./workbook");

function mount(app, store) {
  //  app.get('/api/projects', project.list)
  //  app.get('/api/projects/:id', project.getById)
  //  app.post('/api/projects', project.create)
  //  app.put('/api/projects/:id', project.update)
  //  app.post('/api/projects/:prjId/workbooks', workbook.create)

  app.get("/api/projects/:prjId/workbooks/:wbkId", (req, res) =>
    workbook.getById(store, req, res)
  );
  app.put("/api/projects/:prjId/workbooks/:wbkId", (req, res) =>
    workbook.update(store, req, res)
  );
  app.put("/api/projects/:prjId/workbooks/:wbkId/scenes/:scnId", (req, res) =>
    workbook.updateScene(store, req, res)
  );
}

module.exports = { mount };
