const ChangeFile = 'ChangeFile'

export function changeFile(filepath) {
  return {
    type: ChangeFile,
    filepath,
  }
}

const ChangeScene = 'ChangeScene'

export function changeScene(number) {
  return {
    type: ChangeScene,
    number,
  }
}

const LoadProject = 'LoadProject'
const ProjectError = 'ProjectError'

export function loadProject(filepath) {
  return (dispatch, getState, { importModule }) => {
    console.log('loadProject', filepath)

    importModule(`${filepath}/project.yaml`)
      .then((mod) => {
        // console.log('Action: LoadProject ', JSON.stringify(mod.default))
        return dispatch({
          type: LoadProject,
          filepath,
          data: mod.default,
        })
      })
      .catch((error) => {
        // console.log('Action: ProjectError ', error)
        return dispatch({
          type: ProjectError,
          filepath,
          error,
        })
      })
  }
}

const LoadWorkbook = 'LoadWorkbook'
const WorkbookError = 'WorkbookError'

export function loadWorkbook(filepath) {
  return (dispatch, getState, { importModule }) => {
    console.log('loadModule', filepath)

    importModule(filepath)
      .then((mod) => {
        console.log('Action: LoadWorkbook ', JSON.stringify(mod.default))
        return dispatch({
          type: LoadWorkbook,
          filepath,
          data: mod.default,
        })
      })
      .catch((error) => {
        console.log('Action: WorkbookError ', error)
        return dispatch({
          type: WorkbookError,
          filepath,
          error,
        })
      })
  }
}

const LoadResource = 'LoadResource'
const ResourceError = 'ResourceError'

export function loadResource(filepath, loader, lang = 'js') {
  return (dispatch) => {
    console.log('loadResource', filepath, lang)

    loader(filepath)
      .then((mod) => {
        // console.log('Action: LoadResource ', filepath, lang, mod)
        return dispatch({
          type: LoadResource,
          lang,
          data: mod,
        })
      })
      .catch((error) => {
        // console.log('Action: LoadError ', error)
        return dispatch({
          type: ResourceError,
          lang,
          error,
        })
      })
  }
}

const UpdateScene = 'UpdateScene'

export function updateScene(scene, block, remove, ...blocks) {
  return {
    type: UpdateScene,
    scene,
    block,
    remove,
    data: blocks,
  }
}

const SaveScene = 'SaveScene'

export function saveScene(scene) {
  return {
    type: SaveScene,
    scene,
  }
}

export default {
  ChangeFile,
  ChangeScene,
  LoadProject,
  ProjectError,
  LoadWorkbook,
  WorkbookError,
  LoadResource,
  ResourceError,
  UpdateScene,
  SaveScene,
}
