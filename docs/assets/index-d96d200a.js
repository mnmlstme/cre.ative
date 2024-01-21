import { i as init, _ as __vitePreload, r as register } from './runtime-d35e14fc.js';

init({});
__vitePreload(() => import('./scenes.html-e25da98a.js'),true?[]:void 0)
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
__vitePreload(() => import('./styles.css-2d52f42d.js'),true?[]:void 0)
          .then((mod) => register(mod, "styles.css.js", "css", (resource, container) => {
          let sheet = document.createElement("style");
          sheet.innerHTML = resource.default;
          container.appendChild(sheet);
        }));
__vitePreload(() => import('./scenes.svg-8b33140e.js'),true?[]:void 0)
          .then((mod) => register(mod, "scenes.svg.js", "svg", (resource, container) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resource.default, 'image/svg+xml');
            const body = doc.firstChild;
            const scenes = Object.fromEntries(
              Array.prototype.map.call(body.children, (node) => [
                node && node.dataset.scene, node ])
              .filter(([num]) => Boolean(num)));
            return function render (n, container) {
              scenes[n];
              if( scenes[n] ) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                container.appendChild(svg);
                svg.appendChild(scenes[n]);
              }
            };
          }));
__vitePreload(() => import('./module-547089db.js'),true?[]:void 0)
          .then((mod) => register(mod, "Kram_f626a609_Workbook", "js", null));
