const Kr = require("@cre.ative/kram");

module.exports = {
  name: "web-standard",
  displayName: "Web (W3C Standard)",
  description: "Standard technologies supported by nearly all browsers",
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
const jsDefnRegex = /^\s*(function|class|let|const|var)\s+(\w+)/;

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
      const { scenes, definitions } = Kr.extract(workbook, "html");
      const buildDefn = ([n, attrs, code]) => code;
      const buildScene = ([n, attrs, code]) =>
        `<div id="kramScene-${n + 1}">${code}</div>`;

      return {
        name: `scenes.html`,
        language: "html",
        code: `<html>
	        <div style="display:none;position:absolute;left:0;top:0">
		        ${definitions.map(buildDefn).join("\n")}
	        </div>
	        ${scenes.map(buildScene).join("\n")}  
	      </html>`,
      };
    },
    use: () => "raw-loader",
    bind: (moduleName) => `function(resource, container) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(resource.default, 'text/html')
      const body = doc.body
      const defns = body.firstElementChild
      if ( defns ) { container.appendChild(defns) }
      const rest = body.children
      const scenes = Object.fromEntries(
        Array.prototype.map.call(rest, (node) => {
          const idmatch = node && node.id && node.id.match(/kramScene-(\\d+)/)
          return idmatch ? [idmatch[1], node] : null
        })
        .filter(Boolean)
      )
      return function render (n, container) {
        const scene = scenes[n]
        if( scene ) {
          console.log('Rendering HTML scene ', n, scene)
          for( let child = scene.firstElementChild; child; child = scene.firstElementChild ) {
            if ( child.tagName === 'SCRIPT' ) {
              const text = child.firstChild
              scene.removeChild(child)
              child = document.createElement('script')
              child.appendChild(text)
            } 
            container.appendChild(child) 
          }
        } else {
          console.log('Cannot render HTML scene ',  n)
        }
      }
    }`,
  });

  providesLanguage("css", {
    classify: () => ({
      mode: "define",
    }),
    collate: (workbook) => {
      const { definitions } = Kr.extract(workbook, "css");
      const buildDefn = ([n, attrs, code]) =>
        `/* Kram: CSS in Scene n${n + 1} */\n${code}`;

      return {
        name: "styles.css",
        language: "css",
        code: definitions.map(buildDefn).join("\n"),
      };
    },
    use: () => "raw-loader",
    bind: () => `function(resource, container) {
	    let sheet = document.createElement('style')
	    sheet.innerHTML = resource.default
	    container.appendChild(sheet);
	    return function (scene, container) {}
	  }`,
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
      const { scenes, definitions } = Kr.extract(workbook, "svg");
      const buildScene = ([n, attrs, code]) =>
        `<g id="kramScene-${n + 1}">${code}</g>`;
      const buildDefn = ([n, attrs, code]) => code;

      return {
        name: "artboards.svg",
        language: "svg",
        code: `<svg xmlns="http://www.w3.org/2000/svg">
            <defs>${definitions.map(buildDefn).join("\n")}</defs>
            ${scenes.map(buildScene).join("\n")}
          </svg>`,
      };
    },
    use: () => "raw-loader",
    bind: () => `function(resource, container) {
	      const parser = new DOMParser()
	      const doc = parser.parseFromString(resource.default, 'image/svg+xml')
	      const body = doc.firstChild
        const defns = body.firstElementChild
        if ( defns ) { container.appendChild(defns) }
	      const rest = body.children
	      const scenes = Object.fromEntries(
		      Array.prototype.map.call(rest, (node) => {
			      const idmatch = node && node.id && node.id.match(/kramScene-(\\d+)/)
			      return idmatch ? [idmatch[1], node] : null
		      })
		      .filter(Boolean)
	      )
	      return function render (n, container) {
          const scene = scenes[n]
          if( scenes[n] ) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            container.appendChild(svg)
            svg.appendChild(scenes[n])
          } else {
            console.log('Cannot render, missing SVG scene ',  n)
          }
	      }
	    }`,
  });

  providesLanguage("js", {
    classify: classifyJavascript,
    collate: (workbook) => {
      const { moduleName, imports } = workbook;
      const { scenes, definitions } = Kr.extract(workbook, "js");
      const buildDefn = ([n, attrs, code]) =>
        `// JS Definition from scene ${n + 1}\n${code}`;
      const buildScene = ([n, attrs, code]) =>
        `// JS scene ${n + 1}\n"${n}": function () { ${code} }`;

      return {
        name: "script.js",
        language: "js",
        code: `// module ${moduleName} (ES6)
          ${imports.map(buildImport).join("\n")}
          export function Program ({connectStore}) {
            ${definitions.map(buildDefn).join("\n")}
            return ({
              ${scenes.map(buildScene).join(",\n")}
            })
          }
          export function mount (mountpoint, initial) {
            let Store = {
              root: Object.assign({}, initial),
            };
            const connectStore = (root = "root") => ({
                get: (key) => Store[root][key],
            })
            const program = Program({connectStore})
            return (n, container) => {
              program[n-1].call(container)
            }
          }
        `,
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
  if (defnMatch) {
    return {
      mode: "define",
      definitions: [
        {
          name: defnMatch[2],
          type: keywordToType[defnMatch[1]],
        },
      ],
    };
  } else {
    return { mode: "eval" };
  }
}

function buildImport(spec) {
  if (spec.expose) {
    const list =
      spec.expose === "*" ? spec.expose : "{ " + spec.expose.join(", ") + " }";
    const maybeDefault = spec.as ? spec.as + ", " : "";

    return `import ${maybeDefault}${list} from '${spec.from}'`;
  }

  if (spec.as) {
    return `import ${spec.as} from '${spec.from}'`;
  }

  return `import '${spec.from}'`;
}
