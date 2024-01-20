// module Kram_f626a609_Workbook (ES6)
          
          console.log('Loading module "Kram_f626a609_Workbook"')
          export function Program ({connectStore, initializeStore}) {
            // JS Definition from scene 3
function sayHello(event) {
  window.alert("Hello, Javascript!");
}

            return ({
              
            })
          }
          export function mount (mountpoint, initial) {
            let Store = {
              root: Object.assign({}, initial),
            };
            const connectStore = (path = ["root"]) => {
              let root = Store;
              path.forEach((key) => root = root[key]);
              return ({
                root,
                get: (key) => root[key],
                set: (key, value) => root[key] = value,
                keys: () => Object.keys(root),
              })};
            const program = Program({connectStore})
            return (n, container) => {
              program[n-1].call(container)
            }
          }