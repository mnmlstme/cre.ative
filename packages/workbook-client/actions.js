const ChangeScene = 'ChangeScene'

export function changeScene(number) {
  return {
    type: ChangeScene,
    number,
  }
}

const LoadResource = 'LoadResource'
const ResourceError = 'ResourceError'

export function loadResource(defn) {
  const { loader, language = 'js' } = defn

  return (dispatch, getState) => {
    console.log('loadResource', language)

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
  ChangeScene,
  LoadResource,
  ResourceError,
  UpdateScene,
  SaveScene,
}
