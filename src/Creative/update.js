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
          projectId: action.projectId,
          workbookId: action.workbookId,
          isLoaded: true,
          title,
          scenes: Im.List(scenes).map(immutableScene),
          modules: Im.List(modules || []),
          init,
        })
      )
    }

    case Actions.WorkbookError:
      console.log('update WorkbookError', action.error)
      return state.set(
        'workbook',
        Im.Map({
          ProjectErrorId: action.projectId,
          workbookId: action.workbookId,
          isLoaded: false,
          error: action.error,
        })
      )

    case Actions.UpdateScene: {
      //console.log('update UpdateScene', action)
      const workbook = state.get('workbook') || Im.Map()
      const { scene, block, remove, data } = action
      const path = Array.isArray(block) ? block : [block]
      const top = ['workbook', 'scenes', scene, 'blocks']
      const vector = pathToVector(path, state.getIn(top))
      const rest = data.map(immutableBlock).map(idBlock)

      //console.log('updating block(s)', top, vector, remove, rest)

      return state.updateIn(top.concat(vector.slice(0, -1)), (list) =>
        list.splice(vector.at(-1), remove, ...rest)
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

      let changes = null

      fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workbook.getIn(['scenes', scene])),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Response from saving:', data)
          const { title, modules } = data
          changes = Im.Map({
            title: data.title || workbook.title,
            modules: data.modules
              ? workbook.modules.merge(data.modules)
              : workbook.modules,
          })
        })
        .catch((error) => {
          console.error('Error:', error)
        })

      return changes ? state.set('workbook', workbook.merge(changes)) : state
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
  const parser = new DOMParser()
  console.log('immutableScene', scene)

  return Im.Map({
    title,
    blocks: Im.List(
      blocks
        .filter(([type, attrs, content]) => type !== 'fence' || content !== '')
        .map(immutableBlock)
        .map(idBlock)
    ),
  })
}

function immutableBlock(block) {
  // console.log('immutableBlock', block)

  if (typeof block === 'string') {
    return block
  }

  const [type, attrs, ...rest] = block
  const head = Im.List([type, attrs])

  switch (type) {
    case 'bullet_list':
    case 'ordered_list':
    case 'list_item':
      // children are also immutable
      return head.concat(rest.map(immutableBlock))
    default:
      // children are not immutable
      return head.concat(rest)
  }
}

function idBlock(blk, index) {
  const type = blk.get(0)
  const attrs = blk.get(1)
  const rest = blk.slice(2)

  switch (type) {
    case 'bullet_list':
    case 'ordered_list':
    case 'list_item':
      return Im.List([
        type,
        Object.assign(attrs, { uniqueId: genId('g') }),
        ...rest.map(idBlock),
      ])
    default:
      return attrs.uniqueId
        ? blk
        : Im.List([
            type,
            Object.assign(attrs, { uniqueId: genId('b') }),
            ...rest,
          ])
  }
}

const generators = {}

function getNext(prefix) {
  const next = generators[prefix] || 1
  generators[prefix] = next + 1
  return next
}

function genId(prefix = 'id', len = 8) {
  const s = getNext(prefix).toString()
  const pad =
    s.length >= len
      ? ''
      : Array(len - s.length)
          .fill('0')
          .join('')

  return `${prefix}${pad}${s}`
}

function pathToVector(path, list, partial = [], offset = 0) {
  // console.log('pathToVector', path, list, partial)
  const [key, ...rest] = path
  const index = list.findIndex(([_, { uniqueId }]) => uniqueId === key)
  const vector = partial.concat([index + offset])

  if (rest.length && index >= 0) {
    const group = list.get(index)
    const sublist = group.slice(2)

    return pathToVector(rest, sublist, vector, 2)
  } else {
    return vector
  }
}
