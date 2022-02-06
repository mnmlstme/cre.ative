export function createAgent(primitives, bindings, keymaps) {
  // primitives are already bound to the editor
  // bindings will be bound to the agent

  let context = { keymaps }
  let agent = {
    getContext: (key) => context[key],
    setContext: (more = {}) => {
      Object.assign(context, more)
      return agent
    },
    clearContext: (key) => {
      delete context[key]
      return agent
    },
  }

  const boundEntries = bindings
    .filter((fn) => typeof fn === 'function')
    .map((fn) => [fn.displayName || fn.name, fn.bind(agent)])

  Object.assign(agent, primitives, Object.fromEntries(boundEntries))

  return agent
}

export function delegateUserAction(agent, action, args = [], moreContext = {}) {
  const fn = typeof action === 'function' ? action : action.fn

  console.log('calling user action:', fn.displayName || fn.name)
  return fn.call(agent.setContext(moreContext), ...args)
}

export function delegateKeyEvent(agent, e) {
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
