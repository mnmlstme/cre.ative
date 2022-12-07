const Kr = require("@cre.ative/kram");

module.exports = {
  name: "react-redux",
  description: "React (JSX) for Views and Redux for data model",
  languages: {
    jsx: "Javascript (React)",
    js: "Javascript (ES6)",
    svg: "Scalable Vector Graphics",
    css: "Cascading Style Sheets",
  },
  register,
};

function register({ providesLanguage }) {
  providesLanguage("jsx", {
    use: () => 'babel-loader?{presets:["@babel/preset-react"]}',
    classify: classifyJavascript,
    collate: (workbook, lang) => {
      const evals = Kr.extract(workbook, "eval", lang);
      const defns = Kr.extract(workbook, "define", lang);

      return {
        name: "index.jsx",
        language: lang,
        code: generateJsx(workbook, defns, evals),
      };
    },
  });

  providesLanguage("js", {
    use: () => 'babel-loader?{presets:["@babel/preset-es6"]}',
    classify: classifyJavascript,
    collate: (workbook, lang) => {
      const defns = Kr.extract(workbook, "define", lang);

      return {
        name: "index.js",
        language: lang,
        code: generateJavascript(workbook, defns),
      };
    },
  });

  providesLanguage("svg", {
    use: () => "svg-inline-loader",
  });

  providesLanguage("css", {
    use: () => ({
      loader: "css-loader",
      options: {
        modules: {
          localIdentName: "[local]--[hash:base64:5]",
        },
      },
    }),
    collate: (workbook, lang) => {
      const defns = Kr.extract(workbook, "define", lang);

      return {
        name: "styles.css",
        language: lang,
        code: defns.map((b) => b[2]).join("\n\n/****/\n\n"),
      };
    },
  });
}

const jsxDefnRegex = /^\s*(function|let|const|var)\s+(\w+)/;
const keywordToType = {
  function: "function",
  const: "constant",
  var: "variable",
  let: "variable",
};

function classifyJavascript(code) {
  const jsxDefnMatch = code.match(jsxDefnRegex);
  if (jsxDefnMatch) {
    return {
      mode: "define",
      type: keywordToType[jsxDefnMatch[1]],
      name: jsxDefnMatch[2],
    };
  } else {
    return { mode: "eval" };
  }
}

function generateJavascript({ moduleName, imports }, defns) {
  // generates JSX module
  return `// module ${moduleName} (JSX)
  ${imports.map(genImport).join("\n")}
  `;
}

function generateJsx(workbook, defns, evals) {
  const { moduleName, imports, shape } = workbook;
  const cssDefns = Kr.extract(workbook, "define", "css");

  return `// module ${moduleName} (JSX)
import React from 'react'
import { createRoot } from 'react-dom/client'
const Redux = require('redux')
import Im from 'immutable'
import { Provider, connect } from 'react-redux'
${cssDefns && cssDefns.length ? "import CssModule from './styles.css'" : ""}
${imports.map(genImport).join("\n")}

export function Program (css) {
  ${defns.map(genDefn).join("\n")}

  return (${genProps(shape)}) => ({
    ${evals.map(genView).join(",\n")}
  })
}

const mapStateToProps = state =>
  ( ${genExposeModel(shape)} )

export function mount (mountpoint, initial) {

  const init = Im.Map(initial)
  const store = Redux.createStore(update)
  const props = Object.assign(
    mapStateToProps(store.getState()),
    { dispatch: store.dispatch }
  )
  const css = typeof CssModule !== "undefined" ? CssModule.locals : {}

  const krumbs = Program(css)(props)

  return (n, container) => {
    const root = createRoot(container)
    root.render(React.createElement(krumbs[n-1]), container)
  }

  function update (state = init, action = {}) {
      let value = state.get('value')
      switch (action.type) {
          case 'Increment':
              console.log('increment', state)
              return state.set('value', value + 1)
          case 'Decrement':
              console.log('decrement', state)
              return state.set('value', value - 1)
          default:
              return state
      }
  }
}
`;
}

function genImport(spec) {
  console.log("Generating import statement from spec:", spec);

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

function genProps(shape) {
  const record = Kr.recordType(shape);
  const propNames = Object.keys(record);
  if (record) return `{ ${propNames.join(", ")} }`;

  return "";
}

function genExposeModel(shape) {
  const record = Kr.recordType(shape);
  const expose = (k) => `${k}: state.get('${k}')`;

  if (record)
    return `{
      ${Object.keys(record).map(expose).join(", ")}
    }`;

  return "{}";
}

function genView(block) {
  const [_, attrs, code] = block;
  const { scene } = attrs;

  return `${scene}: () => (<>${code}</>)`;
}

function genDefn(block) {
  return block[2];
}
