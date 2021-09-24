import Im from 'immutable'
import { initial } from './model'
import Actions from './actions'

export function update(state = initial, action = {}) {
  switch (action.type) {
    case Actions.ChangeFile:
      console.log('update ChangeFile', action.filepath)
      return state.set('workbook', {
        filepath: action.filepath,
        isLoaded: false,
      })

    case Actions.LoadWorkbook:
      console.log('update LoadWorkbook', action.data)
      return state.set('workbook', {
        filepath: action.filepath,
        isLoaded: true,
        module: action.data,
      })

    case Actions.WorkbookError:
      console.log('update WorkbookError', action.error)
      return state.set('workbook', {
        filepath: action.filepath,
        isLoaded: false,
        error: action.error,
      })

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
      return state
  }
}
