const Kr = require("@cre.ative/kram");

module.exports = {
  name: "web-standard",
  displayName: "Web (W3C Standard)",
  description:
    "Standard technologies supported by nearly all browsers",
  languages: {
    html: "Hypertext Markup Language (HTML5)",
    css: "Cascading Style Sheets (CSS3)",
    js: "Javascript (ES6)",
    svg: "Scalable Vector Graphics",
  },
  register,
};

const svgDefnRegex = /^\s*<(defs|symbol)[^>]*>/i;
const htmlDefnRegex = /^\s*<(template)[^>]*>/i;
const jsDefnRegex =
  /^\s*(function|class|let|const|var)\s+(\w+)/;

function register({ providesLanguage, defaultModule }) {
  providesLanguage("html", {
    classify: (code) => {
      const defnMatch = code.match(htmlDefnRegex);
      return defnMatch
        ? {
            mode: "define",
            type: defnMatch[1],
          }
        : { mode: "eval" };
    },
    collate: (workbook) => {
      const { scenes, definitions } = Kr.extract(
        workbook,
        "html"
      );
      const buildDefn = ([n, attrs, code]) => code;
      const buildScene = ([n, attrs, code]) =>
        `<div data-scene="${n + 1}">${code}</div>`;

      return (
        definitions.length
          ? [
              {
                name: "templates.html.js",
                language: "html",
                code: jsLiteralModule(`<html>
          <body>
            ${definitions.map(buildDefn).join("\n")}
          </body>
        </html>`),
                bind: `(resource, container) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resource.default, 'text/html');
            const body = doc.body;
            for ( let def = body.firstElementChild; def; def=body.firstElementChild ) {
              container.appendChild(def); }
          }`,
              },
            ]
          : []
      ).concat(
        scenes.length
          ? [
              {
                name: "scenes.html.js",
                language: "html",
                code: jsLiteralModule(`<html>
            <body>${scenes.map(buildScene).join("\n")}</body>
            </html>`),
                bind: `(resource, container) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resource.default, 'text/html');
            const body = doc.body;
            const scenes = Object.fromEntries(
              Array.prototype.map.call(body.children, (node) => [
              node && node.dataset.scene, node ])
              .filter(([num]) => Boolean(num)));
            return function render (n, container) {
              const scene = scenes[n]
              if( scene ) {
                for( let child = scene.firstElementChild; child; child = scene.firstElementChild ) {
                  if ( child.tagName === 'SCRIPT' ) {
                    const text = child.firstChild
                    scene.removeChild(child)
                    child = document.createElement('script')
                    child.appendChild(text)
                  } 
                  container.appendChild(child) 
                }
              } 
            }
          }`,
              },
            ]
          : []
      );
    },
  });

  providesLanguage("css", {
    classify: () => ({
      mode: "define",
    }),
    collate: (workbook) => {
      const { definitions } = Kr.extract(workbook, "css");
      const buildDefn = ([n, attrs, code]) =>
        `/* Kram: CSS in Scene ${n + 1} */\n${code}`;

      return {
        name: "styles.css.js",
        mode: "define",
        language: "css",
        code: jsLiteralModule(
          definitions.map(buildDefn).join("\n")
        ),
        bind: `(resource, container) => {
          let sheet = document.createElement("style");
          sheet.innerHTML = resource.default;
          container.appendChild(sheet);
        }`,
      };
    },
    bind: (moduleName, language) => ``,
  });

  providesLanguage("svg", {
    classify: (code) => {
      const defnMatch = code.match(svgDefnRegex);
      return defnMatch
        ? {
            mode: "define",
            type: defnMatch[1],
          }
        : { mode: "eval" };
    },
    collate: (workbook) => {
      const { scenes, definitions } = Kr.extract(
        workbook,
        "svg"
      );
      const buildDefn = ([n, attrs, code]) => code;
      const buildScene = ([n, attrs, code]) =>
        `<g data-scene="${n + 1}" ${code}</g>`;

      return (
        definitions.length
          ? [
              {
                name: "symbols.svg.js",
                language: "svg",
                code: jsLiteralModule(`<svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
            <defs>${definitions
              .map(buildDefn)
              .join("\n")}</defs></svg>`),
                bind: `(resource, container) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resource.default, 'image/svg+xml');
            const body = doc.firstChild;
            const defns = body.firstElementChild;
            if ( defns ) { container.appendChild(defns) }
          }`,
              },
            ]
          : []
      ).concat(
        scenes.length
          ? [
              {
                name: "scenes.svg.js",
                language: "svg",
                code: jsLiteralModule(`<svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
            <defs>${definitions
              .map(buildDefn)
              .join("\n")}</defs>
            ${scenes.map(buildScene).join("\n")}</svg>`),
                bind: `(resource, container) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(resource.default, 'image/svg+xml');
            const body = doc.firstChild;
            const scenes = Object.fromEntries(
              Array.prototype.map.call(body.children, (node) => [
                node && node.dataset.scene, node ])
              .filter(([num]) => Boolean(num)));
            return function render (n, container) {
              const scene = scenes[n];
              if( scenes[n] ) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                container.appendChild(svg);
                svg.appendChild(scenes[n]);
              }
            };
          }`,
              },
            ]
          : []
      );
    },
  });

  providesLanguage("js", {
    classify: classifyJavascript,
    collate: (workbook) => {
      const { moduleName, imports } = workbook;
      const { scenes, definitions } = Kr.extract(
        workbook,
        "js"
      );
      const buildDefn = ([n, attrs, code]) =>
        `// JS Definition from scene ${n + 1}\n${code}`;
      const buildScene = ([n, attrs, code]) =>
        `// JS scene ${n + 1}\n"${n}": function () { ${code} }`;

      return {
        moduleName,
        name: "module.js",
        language: "js",
        code: `// module ${moduleName} (ES6)
          ${imports.map(buildImport).join("\n")}
          console.log('Loading module "${moduleName}"')
          export function Program ({connectStore, initializeStore}) {
            ${definitions.map(buildDefn).join("\n")}
            return ({
              ${scenes.map(buildScene).join(",\n")}
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
          }`,
      };
    },
  });
}

function classifyJavascript(code) {
  const keywordToType = {
    function: "function",
    const: "constant",
    var: "variable",
    let: "variable",
  };
  const defnMatch = code.match(jsDefnRegex);

  return {
    mode: "define",
    definitions: defnMatch
      ? [
          {
            name: defnMatch[2],
            type: keywordToType[defnMatch[1]],
          },
        ]
      : undefined,
  };
}

function buildImport(spec) {
  if (spec.expose) {
    const list =
      spec.expose === "*"
        ? spec.expose
        : "{ " + spec.expose.join(", ") + " }";
    const maybeDefault = spec.as ? spec.as + ", " : "";

    return `import ${maybeDefault}${list} from '${spec.from}'`;
  }

  if (spec.as) {
    return `import ${spec.as} from '${spec.from}'`;
  }

  return `import '${spec.from}'`;
}

function jsLiteralModule(contents) {
  return ["export default ", contents, ";"].join("`");
}
