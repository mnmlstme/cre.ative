let mountElement = null;
let state = {};
let registry = {};

export function init(initialState, mountpoint) {
  Object.assign(state, initialState);
  mountElement =
    (mountpoint && document.getElementById(mountpoint)) ||
    document.body.appendChild(document.createElement("div"));
  customElements.define("kram-main", MainElement);
  customElements.define("kram-scene", SceneElement);
}

export function register(module, name, language, bindFn) {
  const render = mount(module, name, bindFn);
  if (language && render) {
    const { pending = [] } = registry[language] || {};
    registry[language] = { name, module, render };
    console.log(`[kram-11ty] '${language}' scenes rendered from`, name, render);
    pending.map((resolve) => resolve(render));
  }
}

function whenCanRender(language) {
  return new Promise((resolve, reject) => {
    const reg = registry[language];
    if (reg && reg.render) {
      resolve(reg.render);
    } else if (reg && reg.pending) {
      reg.pending.push(resolve);
    } else {
      registry[language] = { pending: [resolve] };
    }
  });
}

function mount(mod, name, bindfn) {
  let render = (n, container) => {
    console.log("Cannot render scene; module not mounted:", name);
  };

  try {
    if (bindfn) {
      render = bindfn(mod, mountElement, state);
    } else if (typeof (mod && mod.mount) === "function") {
      render = mod.mount(mountElement, state);
    } else {
      render = () => null;
    }
    console.log("Module mounted:", name, render);
  } catch (err) {
    console.log("Warning: module not mounted", name, err);
  }

  return render;
}

class MainElement extends HTMLElement {}

class SceneElement extends HTMLElement {
  constructor() {
    super();

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <section>
        <figure id="rendering">
          <slot name="rendering">Nothing rendered (yet).</slot>
        </figure>
        <main>
          <slot>Discussion</slot>
        </main>
      </section>`;
  }

  connectedCallback() {
    const scnum = this.getAttribute("scene");
    const lang = this.getAttribute("language");
    const slot = document.createElement("div");

    slot.setAttribute("slot", "rendering");
    this.appendChild(slot);

    whenCanRender(lang).then((render) => {
      console.log(`Rendering scene (${lang}):`, scnum);
      render(parseInt(scnum), slot);
    });
  }
}
