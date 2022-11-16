var client

try {
  client = require('@cre.ative/cre-a-tive')
} catch {
  client = require('../dist/client.bundle.js')
}

client
  .Creative({
    importModule: (path, onHotSwap) => {
      const accept = `PROJECTS/${path}`
      const enableHMR = (mod) => {
        if (module && module.hot) {
          if (onHotSwap) {
            module.hot.accept(accept, onHotSwap)
            console.log('Enabled Hot-Swap on module:', accept, mod)
          } else {
            console.log('Hot-Swap available but declined for module:', accept)
            module.hot.decline(accept)
          }
        }
        return mod
      }
      return import(`PROJECTS/${path}`).then(enableHMR)
    },
  })
  .render(document.getElementById('lets-be-cre-at-ive'))
