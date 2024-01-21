import { i as init, _ as __vitePreload, r as register } from './runtime-72832c7a.js';

init({});
__vitePreload(() => import('./templates.html-46532f76.js'),true?[]:void 0)
          .then((mod) => register(mod, "templates.html.js", "html", (resource, container) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resource.default, 'text/html');
            const body = doc.body;
            for ( let def = body.firstElementChild; def; def=body.firstElementChild ) {
              container.appendChild(def); }
          }));
__vitePreload(() => import('./scenes.html-2c4abae9.js'),true?[]:void 0)
          .then((mod) => register(mod, "scenes.html.js", "html", (resource, container) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resource.default, 'text/html');
            const body = doc.body;
            const scenes = Object.fromEntries(
              Array.prototype.map.call(body.children, (node) => [
              node && node.dataset.scene, node ])
              .filter(([num]) => Boolean(num)));
            return function render (n, container) {
              const scene = scenes[n];
              if( scene ) {
                for( let child = scene.firstElementChild; child; child = scene.firstElementChild ) {
                  if ( child.tagName === 'SCRIPT' ) {
                    const text = child.firstChild;
                    scene.removeChild(child);
                    child = document.createElement('script');
                    child.appendChild(text);
                  } 
                  container.appendChild(child); 
                }
              } 
            }
          }));
__vitePreload(() => import('./styles.css-113fb7df.js'),true?[]:void 0)
          .then((mod) => register(mod, "styles.css.js", "css", (resource, container) => {
          let sheet = document.createElement("style");
          sheet.innerHTML = resource.default;
          container.appendChild(sheet);
        }));
__vitePreload(() => import('./module-7c90940f.js'),true?["assets/module-7c90940f.js","assets/lit-element-53a75d8a.js"]:void 0)
          .then((mod) => register(mod, "Kram_d450af87_WebComponents", "js", null));
__vitePreload(() => import('./module-4e4612c3.js'),true?["assets/module-4e4612c3.js","assets/lit-element-53a75d8a.js"]:void 0)
          .then((mod) => register(mod, "Kram_d450af87_WebComponents", "ts", null));
