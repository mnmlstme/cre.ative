import Im from 'immutable'
import { initial } from './model'
import Actions from './actions'

export function update(state = initial, action = {}) {
  switch (action.type) {
    case Actions.ChangeFile:
      console.log(
        'update ChangeFile',
        action.filepath,
        state.get('finder').toObject()
      )
      const finder = state.get('finder') || Im.Map()

      return state.set('finder', finder.set('selected', action.filepath))

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
      console.log('**** Unhandled action:', action)
      return state
  }
}
