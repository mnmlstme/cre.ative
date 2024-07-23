import { u, f, s, x } from './lit-element-7c50da95.js';

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:!0,type:String,converter:u,reflect:!1,hasChanged:f},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.P(o,void 0,t),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,r?{...t,wrapped:!0}:t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:!0,attribute:!1})}

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
console.log('Loading module "Kram_baa252b7_WebComponents"');
function Program({ connectStore, initializeStore }) {
  let HelloWorldElement = class extends s {
    render() {
      return x`<h1>Hello, <slot>world</slot>!</h1> `;
    }
  };
  HelloWorldElement = __decorateClass([
    t("hello-world")
  ], HelloWorldElement);
  let CounterExampleElement = class extends s {
    constructor() {
      super(...arguments);
      this.count = 10;
    }
    render() {
      return x`
      <div>
        Count value is ${this.count}
        <button @click=${this.inc}>
          Increment the Counter
        </button>
      </div>
    `;
    }
    inc() {
      this.count = this.count + 1;
    }
  };
  __decorateClass([
    r()
  ], CounterExampleElement.prototype, "count", 2);
  CounterExampleElement = __decorateClass([
    t("counter-example")
  ], CounterExampleElement);
  return {};
}
function mount(mountpoint, initial) {
  let Store = {
    root: Object.assign({}, initial)
  };
  const connectStore = (path = ["root"]) => {
    let root = Store;
    path.forEach((key) => root = root[key]);
    return {
      root,
      get: (key) => root[key],
      set: (key, value) => root[key] = value,
      keys: () => Object.keys(root)
    };
  };
  const program = Program({ connectStore });
  return (n, container) => {
    program[n - 1].call(container);
  };
}

export { Program, mount };
