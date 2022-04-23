const path = require('path')
import fs from 'fs'
import { create, start } from './server'
import { parse } from 'yaml'

const args = process.argv.slice(2)
const cwd = process.cwd()

start(create(setup(args)))

function setup(args) {
  const [projectsDir] = args
  const basedir = cwd
  const approot = 
    path.resolve(basedir, './node_modules/@cre.ative/cre-a-tive/public')
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
