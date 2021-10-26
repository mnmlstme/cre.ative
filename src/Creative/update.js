import Im from 'immutable'
import marked from 'marked'
import { initial } from './model'
import Actions from './actions'

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
      const { title, scenes, modules, init } = action.data

      return state.set(
        'workbook',
        Im.Map({
          filepath: action.filepath,
          isLoaded: true,
          title,
          scenes: Im.List(scenes),
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
      console.log('update UpdateScene', action.text)
      const workbook = state.get('workbook') || Im.Map()
      const { scene, block, mode, lang, text } = action
      const updateFn = (scn) => {
        if (mode === 'remark') {
          const firstRem =
            scn.blocks.slice(0, block).filter((b) => b.mode === 'remark')
              .length == 0
          const tokens = marked.lexer(text)
          const hd0 = firstRem && tokens.filter((t) => t.type === 'heading')[0]
          const title = hd0 ? hd0.text : scn.title

          return {
            title,
            blocks: scn.blocks.splice(block, 1, { mode, tokens }),
          }
        } else {
          return {
            title: scn.title,
            blocks: scn.blocks.splice(block, 1, { mode, lang, text }),
          }
        }
        const newBlock =
          mode === 'remark'
            ? { mode, tokens: marked.lexer(text) }
            : { mode, lang, text }

        const title = scn.title
      }

      return state.updateIn(['workbook', 'scenes', scene], updateFn)
    }

    case Actions.SaveWorkbook:
      console.log('update SaveWorkbook (UNIMPLEMENTED)')
      return state

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
