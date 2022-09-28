const path = require('path')
const fs = require('fs')
const { create, start } = require('@cre.ative/kram-express-webpack')
const { parse } = require('yaml')

const PORT = 3000
const args = process.argv.slice(2)
const cwd = process.cwd()
const options = setup(args)

console.log('server options:', options)

create(options).then((app) => {
  app.use(['/app', '/app/*'], function (req, res, next) {
    // all routes send the same HTML
    const htmlfile = path.join(options.approot, 'index.html')
    res.sendFile(htmlfile)
  })

  app.get('/', function (req, res) {
    res.redirect('/app')
  })

  start(app, options.port || PORT)
})

function getAppRoot() {
  const pkg = '@cre.ative/cre-a-tive'
  let modulepath = path.join('./node_modules', pkg)

  try {
    console.log(`Looking for ${pkg}`)
    modulepath = require.resolve(pkg)
    console.log(`Found ${pkg}:`, modulepath)
  } catch (e) {
    if (!fs.existsSync(modulepath)) {
      modulepath = '.'
    }
  }

  return path.join(modulepath, 'public')
}

function setup(args) {
  const [projectsDir] = args
  const basedir = cwd
  const approot = path.resolve(basedir, getAppRoot())
  const docroot = path.resolve(basedir, projectsDir || './projects')
  const indexFile = path.resolve(docroot, './index.yaml')

  const { projects, platforms } = readIndex(indexFile)

  return {
    basedir,
    approot,
    docroot,
    projects,
    platforms,
  }
}

function readIndex(filename) {
  const file = fs.readFileSync(filename, 'utf8')

  console.log('=== Index file ===\n', file)
  return Object.assign({}, { projects: [], platforms: {} }, parse(file))
}
