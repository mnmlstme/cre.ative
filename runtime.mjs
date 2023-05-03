let mountElement = null;
let state = {};
let registry = {};

export function init(initialState, mountpoint = "kram-mountpoint") {
  Object.assign(state, initialState);
  mountElement = document.getElementById(mountpoint);
  customElements.define("kram-main", MainElement);
  customElements.define("kram-scene", SceneElement);
}

export function register(module, name) {
  const render = mount(module, name);
  registry[name] = { name, module, render };
}

function mount(mod, name) {
  let render = (n, container) => {
    console.log("Cannot render scene; module not mounted:", name);
  };

  try {
    render = mod.mount(mountElement, state);
    console.log("Module mounted:", name);
  } catch (err) {
    console.log("Warning: module not mounted", name, err);
  }

  return render;
}

class MainElement extends HTMLElement {}

class SceneElement extends HTMLElement {}
