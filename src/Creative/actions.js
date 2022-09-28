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

const LoadIndex = 'LoadIndex'
const IndexError = 'IndexError'

export function loadIndex() {
  return (dispatch, getState, { importModule }) => {
    console.log('loadIndex')

    importModule(`index.yaml`)
      .then((mod) => {
        return dispatch({
          type: LoadIndex,
          data: mod.default,
        })
      })
      .catch((error) => {
        return dispatch({
          type: IndexError,
          error,
        })
      })
  }
}

const ChangeProject = 'ChangeProject'

export function changeProject(projectId) {
  return (dispatch) => {
    console.log('changeProject', projectId)

    return dispatch({
      type: ChangeProject,
      data: projectId,
    })
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

export function loadWorkbook(projectId, workbookId) {
  const filepath = `${projectId}/${workbookId}.md`

  return (dispatch, getState, { importModule }) => {
    console.log('loadWorkbook', projectId, workbookId)

    importModule(filepath)
      .then((mod) => {
        console.log('Action: LoadWorkbook ', JSON.stringify(mod.default))
        return dispatch({
          type: LoadWorkbook,
          projectId,
          workbookId,
          data: mod.default,
        })
      })
      .catch((error) => {
        console.log('Action: WorkbookError ', error)
        return dispatch({
          type: WorkbookError,
          projectId,
          workbookId,
          error,
        })
      })
  }
}

const LoadResource = 'LoadResource'
const ResourceError = 'ResourceError'

export function loadResource(defn) {
  const { use, filepath, loader, language = 'js' } = defn

  return (dispatch, getState, { importResource }) => {
    console.log('loadResource for module', filepath)

    const onHotSwap = () => {
      console.log('Hot swap notification for', defn)
      dispatch(loadResource(defn))
    }

    loader(onHotSwap)
      .then((mod) => {
        console.log('Action: LoadResource ', language, mod)
        return dispatch({
          type: LoadResource,
          lang: language,
          data: mod,
        })
      })
      .catch((error) => {
        // console.log('Action: LoadError ', error)
        return dispatch({
          type: ResourceError,
          lang: language,
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
  LoadIndex,
  IndexError,
  ChangeProject,
  LoadProject,
  ProjectError,
  LoadWorkbook,
  WorkbookError,
  LoadResource,
  ResourceError,
  UpdateScene,
  SaveScene,
}
