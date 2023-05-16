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

class MainElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).appendChild(
      MainElement.html_template.cloneNode(true)
    );
  }

  static html_template = template`<article>
    <header>
      <h1><slot name="title">Untitled Workbook</slot></h1>
      <nav><slot name="nav"><a href="#">Top</a></slot></nav>
    </header>
    <main><slot></slot></main>
  </article>
  <style>
    article {
      display: grid;
      grid-template-columns: var(--grid-size-sidebar) var(--grid-size-main) var(--grid-size-extra);
      grid-template-areas:
        "hd hd nav"
        "mn mn mn";
    }
    header { display: contents; }
    h1 { grid-area: hd; }
    nav { grid-area: nav; }
    main { grid-area: mn; }
  </style>
  `;
}

class SceneElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).appendChild(
      SceneElement.html_template.cloneNode(true)
    );
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

  static html_template = template`<section>
    <figure id="rendering">
      <slot name="rendering">Nothing rendered (yet).</slot>
    </figure>
    <slot name="scenecode">No code for this scene.</slot>
    <slot name="title"><h1>Untitled</h1></slot>
    <main>
      <slot>Discussion</slot>
    </main>
  </section><style>
    :host { display: contents; }
    section {
      display: grid;
      grid-template-columns: 2fr 5fr 3fr;
      grid-template-columns: subgrid; /* where supported */
      grid-template-areas:
        "title scene scene"
        ". code  code"
        ". code  code"
    }
    figure {
      grid-area: scene;
      width: fit-content;
      height: auto;
      margin: 0 auto;
    }
    ::slotted([slot="title"]) { grid-area: title; }
    ::slotted([slot="scenecode"]) { grid-area: code; }
    main { display: contents; }
  </style>`;
}

function template(strings, ...values) {
  const html = strings.flatMap((s, i) => (i ? [values[i - 1], s] : [s]));
  let tpl = document.createElement("template");
  tpl.innerHTML = html;
  return tpl.content;
}
