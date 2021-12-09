const Kr = require("kram");

module.exports = {
  collate,
  bind,
  classify,
};

function bind(moduleName, lang) {
  switch (lang) {
    case "jsx":
      return `function(resource, container, initial) {
        resource.mount(container, initial)
      }`;
    case "css":
      return `function(resource, container) {
        let sheet = document.createElement('style')
        sheet.innerHTML = resource.default
        container.appendChild(sheet);
      }`;
    default:
      return null;
  }
}

const jsxDefnRegex = /^\s*(function|let|const|var)\s+(\w+)/;
const keywordToType = {
  function: "function",
  const: "constant",
  var: "variable",
  let: "variable",
};

function classify(code, lang) {
  switch (lang) {
    case "jsx":
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
    default:
      return { mode: "define" };
  }
}

function collate(workbook, lang) {
  const evals = Kr.extract(workbook, "eval", lang);
  const defns = Kr.extract(workbook, "define", lang);

  switch (lang) {
    case "jsx":
      return {
        name: "index.jsx",
        language: "jsx",
        code: generateJsx(evals, defns, workbook),
      };
    case "css":
      return {
        name: "styles.css",
        language: "css",
        code: defns.map((b) => b.text).join("\n/****/\n\n"),
      };
    default:
      return {
        name: `data.${lang}`,
        language: lang,
        code: defns.join("\n"),
      };
  }
}

function generateJsx(evals, defns, { moduleName, imports, shape }) {
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
  return block
    ? `<li key="${block.id}" id="${block.id}">
       ${block.text.split("\n").join("\n        ")}
     </li>
    `
    : "<li></li>";
}

function genDefn(block) {
  return block.text;
}
