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

const LoadWorkbook = 'LoadWorkbook'
const WorkbookError = 'WorkbookError'
const LoadResource = 'LoadResource'
const ResourceError = 'ResourceError'

export function loadWorkbook(filepath) {
  return (dispatch) => {
    console.log('loadModule', filepath)
    import(`Workbooks/${filepath}`)
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

export function loadResource(filepath, loader, lang = 'js') {
  return (dispatch) => {
    console.log('loadResource', filepath, lang)

    loader(filepath)
      .then((mod) => {
        console.log('Action: LoadResource ', filepath, lang, mod)
        return dispatch({
          type: LoadResource,
          lang,
          data: mod,
        })
      })
      .catch((error) => {
        console.log('Action: LoadError ', error)
        return dispatch({
          type: ResourceError,
          lang,
          error,
        })
      })
  }
}

export default {
  ChangeFile,
  ChangeScene,
  LoadWorkbook,
  WorkbookError,
  LoadResource,
  ResourceError,
}
