var client

try {
  client = require('@cre.ative/cre-a-tive')
} catch {
  client = require('../dist/client.bundle.js')
}

client
  .Creative({
    importModule: (path) => import(`PROJECTS/${path}`),
  })
  .render(document.getElementById('lets-be-cre-at-ive'))
