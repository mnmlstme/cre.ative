const Kr = require("@cre.ative/kram");

module.exports = {
  name: "react-native",
  description: "React Native rendered in browser by react-native-web",
  languages: {
    jsx: "Javascript (React)",
    js: "Javascript (ES6)",
  },
  register,
};

function register({ providesLanguage }) {
  providesLanguage("jsx", {
    use: () =>
      'babel-loader?{presets:["@babel/preset-react"],"plugins":[["react-native-web",{"commonjs":true}]]}',
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
    use: () =>
      'babel-loader?{presets:["@babel/preset-env"],"plugins":[["react-native-web",{"commonjs":true}]]}',
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

  return `// module ${moduleName} (JSX)
import React from 'react'
import { AppRegistry } from 'react-native'
const Redux = require('redux')
import Im from 'immutable'
import { Provider, connect } from 'react-redux'
${imports.map(genImport).join("\n")}

${defns.map(genDefn).join("\n")}

const Program = (${genProps(shape)}) => ({
  ${evals.map(genView).join(",\n")}
})

const mapStateToProps = state =>
  ( ${genExposeModel(shape)} )

export function mount (mountpoint, initial) {

  const init = Im.Map(initial)
  const store = Redux.createStore(update)
  const props = Object.assign(
    mapStateToProps(store.getState()),
    {dispatch: store.dispatch}
  )

  const krumbs = Program(props)

  return (n, container) => {
    const appname = ['Scene', n].join('-')
    AppRegistry.registerComponent(appname, () => krumbs[n-1])
    AppRegistry.runApplication(appname, { rootTag: container })
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
  const symbols = [spec.as, spec.expose && `{${spec.expose.join(",")}}`].filter(
    Boolean
  );
  return `import ${symbols.join(",")} from '${spec.from}'`;
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
