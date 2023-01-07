const path = require('path')
const fs = require('fs')
const yargs = require('yargs/yargs')
import express from 'express'
const { create, publish, start } = require('@cre.ative/kram-express-webpack')
const { parse } = require('yaml')

const PORT = 3000
const args = process.argv.slice(2)
const cwd = process.cwd()
const options = setup(args)

console.log('server options:', options)

if (options.publish) {
  publish(options)
}

if (options.serve) {
  create(options).then((app) => {
    start(app, options.port || PORT)
  })
}

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

  return path.join(modulepath, 'dist')
}

function setup(args) {
  const argv = yargs(args)
    .option('dev', {
      alias: 'd',
      type: 'boolean',
      description: 'Run in dev mode, watching for changed files',
    })
    .option('hot', {
      alias: 'h',
      type: 'boolean',
      description: "Enable HMR; implies '--dev'",
    })
    .option('api', {
      alias: 'a',
      type: 'boolean',
      decription: 'Enable Kram API server for client-side editing',
    })
    .option('publish', {
      alias: 'p',
      type: 'boolean',
      description: 'Create static website of all projects.',
    })
    .option('serve', {
      alias: 's',
      type: 'boolean',
      description: 'Start an HTTP server to serve the projects',
    })
    .parse()
  const { dev, hot, api, publish, serve } = argv
  const [projectsDir] = argv._
  const basedir = cwd
  const pubdir = path.join(basedir, 'public')
  const approot = path.resolve(basedir, getAppRoot())
  const docroot = path.resolve(basedir, projectsDir || './projects')
  const indexFile = path.resolve(docroot, './index.yaml')
  const { projects, platforms } = readIndex(indexFile)
  const entries = Object.entries(projects)
    .map(([projId, projPath]) => {
      const projFile = path.resolve(docroot, projPath, 'project.yaml')
      const { workbooks } = readProject(projFile)

      return workbooks.map((wb) => path.join(projPath, wb.file))
    })
    .flat()

  return {
    basedir,
    public: pubdir,
    docroot,
    projects,
    platforms,
    entries,
    template: path.join(approot, 'templates', 'workbook.html'),
    app: '@cre.ative/cre-a-tive',
    dev: hot ? 'hmr' : dev,
    api,
    publish,
    serve: serve || api || dev || hot,
  }
}

function readIndex(filename) {
  const file = fs.readFileSync(filename, 'utf8')

  console.log('=== Index file ===\n', file)
  return Object.assign({}, { projects: [], platforms: {} }, parse(file))
}

function readProject(filename) {
  const file = fs.readFileSync(filename, 'utf8')

  console.log('=== Project file ===\n', file)
  return Object.assign({}, { workbooks: [] }, parse(file))
}
