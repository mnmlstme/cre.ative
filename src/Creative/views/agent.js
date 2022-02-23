class Agent {
  constructor(keymaps) {
    this._context = { keymaps }
  }

  getContext(key) {
    return this._context[key]
  }

  setContext(more = {}) {
    Object.assign(this._context, more)
    return this
  }

  clearContext(key) {
    delete this._context[key]
    return this
  }
}

export function agentFactory(primitives, coreMode, modes) {
  // primitives are already bound to the editor
  // mode.bindings will be bound to the agent

  let cache = {}

  return (modename) => {
    const cached = cache[modename]

    if (cached) {
      console.log(`Using cached agent for ${modename}:`, cached)
      return cached
    }

    const mode = modes.find((m) => m.name === modename)
    let agent = (cache[modename] = new Agent(
      (mode ? mode.keymaps : []).concat(coreMode.keymaps)
    ))
    const boundEntries = (mode ? mode.bindings : [])
      .concat(coreMode.bindings)
      .filter((fn) => typeof fn === 'function')
      .map((fn) => [fn.displayName || fn.name, fn.bind(agent)])

    Object.assign(agent, primitives, Object.fromEntries(boundEntries))

    console.log(`Built agent for ${modename}:`, agent)
    return agent
  }
}

export function delegateUserAction(agent, action, args = [], moreContext = {}) {
  const fn = typeof action === 'function' ? action : action.fn

  console.log('calling user action:', fn.displayName || fn.name)
  return fn.call(agent.setContext(moreContext), ...args)
}

export function delegateKeyEvent(agent, e) {
  const block = e.target

  if (['Shift', 'Meta', 'Alt', 'Control'].includes(e.key)) {
    // ignore modifier keys on their own
    return
  }

  const options = agent.getContext('options')

  if (options) {
    handlePopupKeyEvent(agent, e, options)
  } else {
    const action = lookupKeyEvent(e, agent.getContext('keymaps'))

    if (action) {
      invokeOnEvent(agent, e, action, 'keydown')
    }
  }
}

function handlePopupKeyEvent(agent, e, options) {
  const code = keyCombo(e)

  console.log('popup key event', e.type, code)

  const chosen =
    options.find((opt) => opt.key === code) ||
    (e.key === 'Escape' && { key: e.key, action: agent.doNothing })

  if (chosen) {
    console.log('User Selected', chosen.key, e.type)
    invokeOnEvent(agent, e, chosen.action, 'keyup')
  }

  switch (e.type) {
    case 'keyup':
      if (!chosen) {
        console.log('!!! Invalid key, try again')
        // TODO: beep or flash the popup or something
      } else {
        agent.cancelPrompt()
      }
      break
    case 'keydown':
      if (chosen) {
        // TODO highlight key being pressed
      }
      break
    default:
  }

  e.preventDefault()
  e.stopPropagation()
}

function invokeOnEvent(agent, e, action, defaultOn = 'keydown') {
  const { on, fn } =
    typeof action === 'function' ? { on: defaultOn, fn: action } : action

  if (on === e.type) {
    e.preventDefault()
    e.stopPropagation()
    delegateUserAction(agent, fn, [], { event: e })
  }
}

function lookupKeyEvent(e, keymaps) {
  const code = keyCombo(e)

  console.log('Key Event:', e.type, code)

  const fname = keymaps.reduce((accum, current) => accum || current[code], null)

  return fname
}

function keyCombo({ key, shiftKey, ctrlKey, altKey, metaKey }) {
  const code = [
    altKey && 'Opt-', // Alt on windows
    metaKey && 'Cmd-', // Windows key on windows
    shiftKey && key.length > 1 && 'S-',
    ctrlKey && '^',
    key,
  ]
    .filter((s) => !!s)
    .join('')

  return code
}
