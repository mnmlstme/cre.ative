import Im from 'immutable'
import { initial } from './model'
import Actions from './actions'

const API = '/api'

export function update(state = initial, action = {}) {
  switch (action.type) {
    case Actions.ChangeFile: {
      console.log(
        'update ChangeFile',
        action.filepath,
        state.get('finder').toObject()
      )
      const finder = state.get('finder') || Im.Map()

      return state.set('finder', finder.set('selected', action.filepath))
    }

    case Actions.ChangeScene:
      console.log('update ChangeScene', action.number)
      return state.set('current', Number.parseInt(action.number))

    case Actions.LoadProject: {
      console.log('update LoadProject', action.data)
      const finder = state.get('finder') || Im.Map()

      return state.set('finder', finder.set('workbooks', action.data.workbooks))
    }

    case Actions.ProjectError: {
      console.log('update ProjectError', action.error)
      const finder = state.get('finder') || Im.Map()

      return state.set('finder', finder.set('workbooks', []))
    }

    case Actions.LoadWorkbook: {
      console.log('update LoadWorkbook', action.data)
      const { basename, title, scenes, modules, init } = action.data

      return state.set(
        'workbook',
        Im.Map({
          basename,
          filepath: action.filepath,
          isLoaded: true,
          title,
          scenes: Im.List(scenes).map(immutableScene),
          modules,
          init,
        })
      )
    }

    case Actions.WorkbookError:
      console.log('update WorkbookError', action.error)
      return state.set(
        'workbook',
        Im.Map({
          filepath: action.filepath,
          isLoaded: false,
          error: action.error,
        })
      )

    case Actions.UpdateScene: {
      console.log('update UpdateScene', action)
      const workbook = state.get('workbook') || Im.Map()
      const { scene, block, mode, lang, text } = action
      const updateFn = (blk) => {
        return Object.assign({}, blk, { mode, lang, text })
      }

      return state.updateIn(
        ['workbook', 'scenes', scene, 'blocks', block],
        updateFn
      )
    }

    case Actions.SaveScene: {
      console.log('update SaveScene', action)
      const workbook = state.get('workbook') || Im.Map()
      const finder = state.get('finder') || Im.Map()
      const { scene } = action
      const endpoint = [
        API,
        'projects',
        finder.get('project'),
        'workbooks',
        workbook.get('basename'),
        'scenes',
        scene,
      ].join('/')

      debugger

      fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workbook.getIn(['scenes', scene])),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Saved:', data)
        })
        .catch((error) => {
          console.error('Error:', error)
        })

      return state
    }

    case Actions.LoadResource: {
      console.log('update LoadResource', action.data)
      const resources = state.get('resources') || Im.Map()

      return state.set(
        'resources',
        resources.set(action.lang, {
          isLoaded: true,
          module: action.data,
        })
      )
    }

    case Actions.ResourceError: {
      console.log('update ResourceError', action.error)
      const resources = state.get('resources') || Im.Map()

      return state.set(
        'resources',
        resources.set(action.lang, {
          isLoaded: false,
          error: action.error,
        })
      )
    }

    default:
      console.log('**** Unhandled action:', action)
      return state
  }
}

function immutableScene(scene) {
  const { title, blocks } = scene

  return Im.Map({
    title,
    blocks: Im.List(blocks.map((blk, j) => Object.assign(blk, { index: j }))),
  })
}
