const Kr = require("kram");

module.exports = {
  name: 'react-redux',
  description: 'React (JSX) for Views and Redux for data model',
  languages: {
    jsx: 'Javascript (React)',
    js: 'Javascript (ES6)',
    svg: 'Scalable Vector Graphics',
    css: 'Cascading Style Sheets'
  },
  register
};

function register({providesLanguage}) {
  providesLanguage('jsx', {
    use: () =>
      'babel-loader?{presets:["@babel/preset-react"]}',
    classify: classifyJavascript,
    collate: (workbook, lang) => {
      const evals = Kr.extract(workbook, "eval", lang);
      const defns = Kr.extract(workbook, "define", lang);

      return {
        name: "index.jsx",
        language: lang,
        code: generateJsx(workbook, defns, evals),
      }
    },
  })

  providesLanguage('js', {
    use: () =>
      'babel-loader?{presets:["@babel/preset-es6"]}',
    classify: classifyJavascript,
    collate: (workbook, lang) => {
      const defns = Kr.extract(workbook, "define", lang);

      return {
        name: "index.js",
        language: lang,
        code: generateJavascript(workbook, defns),
      }
    },
  })

  providesLanguage('svg', {
    use: () =>
      'svg-inline-loader',
  })

  providesLanguage('css', {
    use: () =>
      'css-loader',
    collate: (workbook, lang) => {
      const defns = Kr.extract(workbook, "define", lang);

      return {
        name: "styles.css",
        language: lang,
        code: defns.map((b) => b[2]).join("\n/****/\n\n"),
      };
    }
  })
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

function generateJavascript({moduleName, imports}, defns ) {
  // generates JSX module
  return `// module ${moduleName} (JSX)
  ${imports.map(genImport).join("\n")}
  `
}

function generateJsx({ moduleName, imports, shape }, defns, evals) {
  // generates JSX module
  return `// module ${moduleName} (JSX)
import React from 'react'
import ReactDOM from 'react-dom'
const Redux = require('redux')
import Im from 'immutable'
import { Provider, connect } from 'react-redux'
${imports.map(genImport).join("\n")}

let Styles = {}

${defns.map(genDefn).join("\n")}

const Program = (${genProps(shape)}) =>
  (<ol>
      ${evals.map(genView).join("\n")}
  </ol>)

const mapStateToProps = state =>
  ( ${genExposeModel(shape)} )

function mount (mountpoint, initial) {

  const init = Im.Map(initial)
  const store = Redux.createStore(update)
  const props = Object.assign(
    mapStateToProps(store.getState()),
    {dispatch: store.dispatch}
  )

  ReactDOM.render(
    React.createElement(Program, props),
    mountpoint
  )

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

export {
    Program,
    mount
}
`;
}

function genImport(spec) {
  return `import ${spec.as} from '${spec.from}'`;
}

function genProps(shape) {
  const record = Kr.recordType(shape);
  if (record) return `{ ${Object.keys(record).join(", ")} }`;

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
  if (!block) {
    return "<li></li>"
  }

  const [_, attrs, code] = block

  return (
    `<li key="${attrs.id}" id="${attrs.id}">
     ${code.split("\n").join("\n        ")}
    </li>
    `)
}

function genDefn(block) {
  return block[2];
}
