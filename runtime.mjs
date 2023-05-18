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
      grid-template-columns: var(--grid-width-margin) var(--page-grid-template) var(--grid-width-margin);
      grid-template-areas:
        "hd hd hd nav nav nav";
      background: var(--page-background);
      color: var(--page-text-color);
      font-family: var(--font-body);
      padding-inline: var(--spacing-medium);
    }
    header { display: contents; }
    h1 {   
      font-family: var(--font-display);
      color: var(--color-accent);
      grid-area: hd; }
    nav { grid-area: nav; }
    main { 
      display: grid; 
      grid-template-columns: var(--grid-width-margin) var(--page-grid-template) var(--grid-width-margin);
      grid-template-columns: subgrid; 
      grid-column: 1/-1;
    }
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
    <header>
      <figure id="rendering">
        <slot name="rendering">Nothing rendered (yet).</slot>
      </figure>
      <slot name="scenecode">No code for this scene.</slot>
      <slot name="title"><h1>Untitled</h1></slot>
    </header>
    <main>
      <slot>Discussion</slot>
    </main>
  </section><style>
    :host { display: contents; }
    section {
      display: contents;
    }
    header {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: var(--page-grid-template);
      grid-template-columns: subgrid;
      grid-template-areas:
        "scene scene scene scene scene scene"
        ".     title code  code  code  .";
      align-items: baseline;
      margin-block: var(--spacing-large);
    }
    figure {
      display: flex;
      aspect-ratio: 4;
      margin: 0;
      padding-inline: var(--scene-padding-inline);
      flex-direction: column;
      align-items: start;
      justify-content: space-around;
      grid-area: scene;
      background: var(--scene-background);
      border: var(--scene-border);
      border-radius: var(--scene-border-radius);
      font-family: var(--scene-font);
      color: var(--scene-text-color);
    }
    ::slotted([slot="title"]) { 
      grid-area: title;
      margin: 0;
      margin-left: var(--scene-padding-inline);
    }
    ::slotted([slot="scenecode"]) { grid-area: code; }
    ::slotted(h1), ::slotted(h2), ::slotted(h3) {
      font-family: var(--font-display);
      color: var(--color-accent);
    }
    main { 
      display: grid;
      grid-column: start / end;
      grid-template-columns: var(--page-grid-template);
      grid-template-columns: subgrid;
      align-items: baseline;
      gap: var(--spacing-small) var(--spacing-medium);
    }
  </style>`;
}

function template(strings, ...values) {
  const html = strings.flatMap((s, i) => (i ? [values[i - 1], s] : [s]));
  let tpl = document.createElement("template");
  tpl.innerHTML = html;
  return tpl.content;
}
