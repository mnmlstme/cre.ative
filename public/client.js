var client

try {
  client = require('@cre.ative/cre-a-tive')
} catch {
  client = require('../dist/client.bundle.js')
}

client
  .Creative({
    importModule: (path, onHot) =>
      importFromWebpackContext(
        () => require.context('PROJECTS/'),
        `./${path}`,
        onHot
      ),
    importResource: (path, onHot) =>
      importFromWebpackContext(
        () => require.context('DEKRAM/'),
        `./${path}`,
        onHot
      ),
  })
  .render(document.getElementById('lets-be-cre-at-ive'))

// the rest belongs in kram-express-webpack...

let currentModules = {}
let hotSwapHandlers = {}

function importFromWebpackContext(contextFn, filepath, onHot) {
  let context = contextFn()
  const moduleKey = (p) => `${p} {${context.id}}`

  if (module.hot && onHot) {
    console.log(
      'Accepting Hot Swap notifications for module',
      moduleKey(filepath)
    )

    hotSwapHandlers[moduleKey(filepath)] = onHot
    module.hot.accept(context.id, function () {
      let freshContext = contextFn()
      let freshModules = freshContext
        .keys()
        .map((k) => [k, freshContext(k)])
        .filter(([k, m]) => currentModules[moduleKey(k)] !== m)

      freshModules.forEach(([k, m]) => {
        const handler = hotSwapHandlers[moduleKey(k)]

        currentModules[moduleKey(k)] = m
        if (handler) {
          handler(k, m)
        }
      })
    })
  }

  return new Promise((resolve, reject) => {
    const mod = context(filepath)
    if (mod) {
      currentModules[moduleKey(filepath)] = mod
      resolve(mod)
    } else {
      reject(`Module out of context: ${moduleKey(filepath)}`)
    }
  })
}
