/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api.js":
/*!********************!*\
  !*** ./src/api.js ***!
  \********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const workbook = __webpack_require__(/*! ./workbook */ \"./src/workbook.js\");\n\nfunction mount(app, store) {\n  //  app.get('/api/projects', project.list)\n  //  app.get('/api/projects/:id', project.getById)\n  //  app.post('/api/projects', project.create)\n  //  app.put('/api/projects/:id', project.update)\n  //  app.post('/api/projects/:prjId/workbooks', workbook.create)\n\n  app.get(\"/api/projects/:prjId/workbooks/:wbkId\", (req, res) =>\n    workbook.getById(store, req, res)\n  );\n  app.put(\"/api/projects/:prjId/workbooks/:wbkId\", (req, res) =>\n    workbook.update(store, req, res)\n  );\n  app.put(\"/api/projects/:prjId/workbooks/:wbkId/scenes/:scnId\", (req, res) =>\n    workbook.updateScene(store, req, res)\n  );\n}\n\nmodule.exports = { mount };\n\n\n//# sourceURL=webpack://@cre.ative/kram-express-webpack/./src/api.js?");

/***/ }),

/***/ "./src/configure.js":
/*!**************************!*\
  !*** ./src/configure.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"configure\": () => (/* binding */ configure)\n/* harmony export */ });\nconst path = __webpack_require__(/*! path */ \"path\");\nconst webpack = __webpack_require__(/*! webpack */ \"webpack\");\nconst HtmlWebpackPlugin = __webpack_require__(/*! html-webpack-plugin */ \"html-webpack-plugin\");\n\nfunction configure(options) {\n  const {\n    basedir,\n    docroot,\n    plugins,\n    entry,\n    library,\n    generated,\n    template,\n    inPlace,\n  } = options;\n  const kramdir = path.resolve(basedir, \"./kram_modules\");\n  const projdir = path.resolve(basedir, \"./projects\");\n\n  const devServer = options.dev\n    ? {\n        devServer: {\n          overlay: true,\n          hot: options.dev === \"hot\",\n        },\n      }\n    : {};\n\n  const htmlGenerators = generated\n    ? generated.map(([entry, template, ...dependencies]) => {\n        const relPath = path.relative(projdir, path.dirname(entry));\n\n        return new HtmlWebpackPlugin({\n          inject: false,\n          cache: false,\n          chunks: [entry].concat(dependencies),\n          filename: path.join(\n            options.public || \"public\",\n            relPath,\n            path.basename(entry, \".md\"),\n            \"index.html\"\n          ),\n          template,\n          scriptLoading: \"blocking\",\n        });\n      })\n    : [];\n\n  return {\n    name: \"kram-webpack\",\n    context: basedir,\n    entry,\n    mode: options.dev ? \"development\" : \"production\",\n    module: {\n      rules: kramRules({ docroot, plugins, kramdir }),\n    },\n    output: {\n      chunkFilename: \"kram.[id].js\",\n      chunkFormat: \"module\",\n      path: path.resolve(__dirname, options.public),\n      library,\n    },\n    resolve: {\n      alias: {\n        PROJECTS: projdir,\n        DEKRAM: kramdir,\n        PUBLIC: path.resolve(__dirname, options.public),\n      },\n      modules: [\"node_modules\"],\n      extensions: [\".js\"],\n      mainFields: [\"browser\", \"main\"],\n    },\n    resolveLoader: {\n      modules: [\"node_modules\"],\n      extensions: [\".js\"],\n      mainFields: [\"loader\", \"main\"],\n    },\n    ...devServer,\n    plugins: (options.dev === \"hot\"\n      ? [new webpack.HotModuleReplacementPlugin()]\n      : []\n    ).concat(htmlGenerators),\n    experiments: { outputModule: true },\n  };\n}\n\nfunction kramRules({ docroot, plugins, kramdir }) {\n  const projectYaml = {\n    test: /\\.yaml$/,\n    include: [docroot],\n    use: \"yaml-loader\",\n  };\n\n  const workbookMd = {\n    test: /\\.md$/,\n    include: [docroot],\n    use: {\n      loader: \"@cre.ative/kram-express-webpack\",\n      options: {\n        platforms: Object.fromEntries(\n          plugins.map(({ name, ...rest }) => [name, rest])\n        ),\n        output: kramdir,\n      },\n    },\n  };\n\n  const pluginRules = plugins.map((plugin) => {\n    const platform = plugin.name;\n    return plugin.modules.map(({ language, use }) => {\n      return {\n        test: RegExp(`\\.${language}\\$`),\n        include: [`${kramdir}/${platform}`],\n        use: use(),\n      };\n    });\n  });\n\n  return [projectYaml, workbookMd].concat(...pluginRules);\n}\n\n\n//# sourceURL=webpack://@cre.ative/kram-express-webpack/./src/configure.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./server */ \"./src/server.js\");\n\n\nconst PORT = 3000;\n\n(0,_server__WEBPACK_IMPORTED_MODULE_0__.create)({ standalone: true }).then((app) => (0,_server__WEBPACK_IMPORTED_MODULE_0__.start)(app, PORT));\n\n\n//# sourceURL=webpack://@cre.ative/kram-express-webpack/./src/main.js?");

/***/ }),

/***/ "./src/server.js":
/*!***********************!*\
  !*** ./src/server.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"create\": () => (/* binding */ create),\n/* harmony export */   \"start\": () => (/* binding */ start)\n/* harmony export */ });\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webpack-dev-middleware */ \"webpack-dev-middleware\");\n/* harmony import */ var webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! webpack-hot-middleware */ \"webpack-hot-middleware\");\n/* harmony import */ var webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api */ \"./src/api.js\");\n/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_api__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _webpack__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./webpack */ \"./src/webpack.js\");\n\n\n\n\n\nconst path = __webpack_require__(/*! path */ \"path\");\n\nasync function create(options) {\n  const app = express__WEBPACK_IMPORTED_MODULE_0___default()();\n  const compiler = await (0,_webpack__WEBPACK_IMPORTED_MODULE_4__.packager)(options);\n\n  app.use(function (err, req, res, next) {\n    console.error(err.stack);\n    res.status(500).send(\"Something broke!\");\n  });\n\n  if (options.dev) {\n    app.use(\n      // Webpack devserver\n      webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_1___default()(compiler, {\n        // middleware options\n      })\n    );\n  }\n\n  if (options.dev === \"hmr\") {\n    app.use(\n      // Webpack HMR devserver\n      webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_2___default()(compiler, {\n        // middleware options\n        log: console.log,\n        path: \"/__webpack_hmr\",\n        heartbeat: 10 * 1000,\n      })\n    );\n  }\n\n  if (!options.quiet) {\n    app.use(requestLogger);\n  }\n\n  if (options.api) {\n    app.use(express__WEBPACK_IMPORTED_MODULE_0___default().json());\n  }\n\n  if (options.serve) {\n    console.log(\"Serving compiled assets from \", options.public);\n    app.use(\"/\", express__WEBPACK_IMPORTED_MODULE_0___default()[\"static\"](options.public));\n    // workbook is a SPA so we need to ignore the tail of the URL:\n    app.use(\"/workbook/:projId/:wbId/*\", function (request, response) {\n      const { projId, wbId } = request.params;\n      response.sendFile(\n        path.resolve(options.public, \"workbook\", projId, wbId, \"index.html\")\n      );\n    });\n  }\n\n  const store = {\n    projectDir: \"./projects\",\n    kramDir: \"./kram_modules\",\n    ...options,\n  };\n\n  (0,_api__WEBPACK_IMPORTED_MODULE_3__.mount)(app, store);\n\n  return app;\n}\n\nfunction requestLogger(req, res, next) {\n  console.log(\"kram-express-webpack:\", [req.method, req.path].join(\" \"));\n  next();\n}\n\nfunction start(app, port = 3000) {\n  app.listen(port, () =>\n    console.log(`Kram server listening at http://localhost:${port}`)\n  );\n}\n\n\n//# sourceURL=webpack://@cre.ative/kram-express-webpack/./src/server.js?");

/***/ }),

/***/ "./src/web-standard-plugin.js":
/*!************************************!*\
  !*** ./src/web-standard-plugin.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const Kr = __webpack_require__(/*! @cre.ative/kram */ \"@cre.ative/kram\");\n\nmodule.exports = {\n  name: \"web-standard\",\n  displayName: \"Web (W3C Standard)\",\n  description: \"Standard technologies supported by nearly all browsers\",\n  languages: {\n    html: \"Hypertext Markup Language (HTML5)\",\n    css: \"Cascading Style Sheets (CSS3)\",\n    js: \"Javascript (ES6)\",\n    svg: \"Scalable Vector Graphics\",\n  },\n  register,\n};\n\nconst svgDefnRegex = /^\\s*<(defs|symbol)[^>]*>/i;\nconst htmlDefnRegex = /^\\s*<(template)[^>]*>/i;\nconst jsDefnRegex = /^\\s*(function|class|let|const|var)\\s+(\\w+)/;\n\nfunction register({ providesLanguage, defaultModule }) {\n  providesLanguage(\"html\", {\n    classify: (code) => {\n      const defnMatch = code.match(htmlDefnRegex);\n      return defnMatch\n        ? {\n            mode: \"define\",\n            type: defnMatch[1],\n          }\n        : { mode: \"eval\" };\n    },\n    collate: (workbook) => {\n      const { scenes, definitions } = Kr.extract(workbook, \"html\");\n      const buildDefn = ([n, attrs, code]) => code;\n      const buildScene = ([n, attrs, code]) =>\n        `<div id=\"kramScene-${n + 1}\">${code}</div>`;\n\n      return {\n        name: `scenes.html`,\n        language: \"html\",\n        code: `<html>\n\t        <div style=\"display:none;position:absolute;left:0;top:0\">\n\t\t        ${definitions.map(buildDefn).join(\"\\n\")}\n\t        </div>\n\t        ${scenes.map(buildScene).join(\"\\n\")}  \n\t      </html>`,\n      };\n    },\n    use: () => \"raw-loader\",\n    bind: (moduleName) => `function(resource, container) {\n      const parser = new DOMParser()\n      const doc = parser.parseFromString(resource.default, 'text/html')\n      const body = doc.body\n      const defns = body.firstElementChild\n      if ( defns ) { container.appendChild(defns) }\n      const rest = body.children\n      const scenes = Object.fromEntries(\n        Array.prototype.map.call(rest, (node) => {\n          const idmatch = node && node.id && node.id.match(/kramScene-(\\\\d+)/)\n          return idmatch ? [idmatch[1], node] : null\n        })\n        .filter(Boolean)\n      )\n      return function render (n, container) {\n        const scene = scenes[n]\n        if( scene ) {\n          console.log('Rendering HTML scene ', n, scene)\n          for( let child = scene.firstElementChild; child; child = scene.firstElementChild ) {\n            if ( child.tagName === 'SCRIPT' ) {\n              const text = child.firstChild\n              scene.removeChild(child)\n              child = document.createElement('script')\n              child.appendChild(text)\n            } \n            container.appendChild(child) \n          }\n        } else {\n          console.log('Cannot render HTML scene ',  n)\n        }\n      }\n    }`,\n  });\n\n  providesLanguage(\"css\", {\n    classify: () => ({\n      mode: \"define\",\n    }),\n    collate: (workbook) => {\n      const { definitions } = Kr.extract(workbook, \"css\");\n      const buildDefn = ([n, attrs, code]) =>\n        `/* Kram: CSS in Scene n${n + 1} */\\n${code}`;\n\n      return {\n        name: \"styles.css\",\n        language: \"css\",\n        code: definitions.map(buildDefn).join(\"\\n\"),\n      };\n    },\n    use: () => \"raw-loader\",\n    bind: () => `function(resource, container) {\n\t    let sheet = document.createElement('style')\n\t    sheet.innerHTML = resource.default\n\t    container.appendChild(sheet);\n\t    return function (scene, container) {}\n\t  }`,\n  });\n\n  providesLanguage(\"svg\", {\n    classify: (code) => {\n      const defnMatch = code.match(svgDefnRegex);\n      return defnMatch\n        ? {\n            mode: \"define\",\n            type: defnMatch[1],\n          }\n        : { mode: \"eval\" };\n    },\n    collate: (workbook) => {\n      const { scenes, definitions } = Kr.extract(workbook, \"svg\");\n      const buildScene = ([n, attrs, code]) =>\n        `<g id=\"kramScene-${n + 1}\">${code}</g>`;\n      const buildDefn = ([n, attrs, code]) => code;\n\n      return {\n        name: \"artboards.svg\",\n        language: \"svg\",\n        code: `<svg xmlns=\"http://www.w3.org/2000/svg\">\n            <defs>${definitions.map(buildDefn).join(\"\\n\")}</defs>\n            ${scenes.map(buildScene).join(\"\\n\")}\n          </svg>`,\n      };\n    },\n    use: () => \"raw-loader\",\n    bind: () => `function(resource, container) {\n\t      const parser = new DOMParser()\n\t      const doc = parser.parseFromString(resource.default, 'image/svg+xml')\n\t      const body = doc.firstChild\n        const defns = body.firstElementChild\n        if ( defns ) { container.appendChild(defns) }\n\t      const rest = body.children\n\t      const scenes = Object.fromEntries(\n\t\t      Array.prototype.map.call(rest, (node) => {\n\t\t\t      const idmatch = node && node.id && node.id.match(/kramScene-(\\\\d+)/)\n\t\t\t      return idmatch ? [idmatch[1], node] : null\n\t\t      })\n\t\t      .filter(Boolean)\n\t      )\n\t      return function render (n, container) {\n          const scene = scenes[n]\n          if( scenes[n] ) {\n            const svg = document.createElementNS(\"http://www.w3.org/2000/svg\", \"svg\");\n            container.appendChild(svg)\n            svg.appendChild(scenes[n])\n          } else {\n            console.log('Cannot render, missing SVG scene ',  n)\n          }\n\t      }\n\t    }`,\n  });\n\n  providesLanguage(\"js\", {\n    classify: classifyJavascript,\n    collate: (workbook) => {\n      const { moduleName, imports } = workbook;\n      const { scenes, definitions } = Kr.extract(workbook, \"js\");\n      const buildDefn = ([n, attrs, code]) =>\n        `// JS Definition from scene ${n + 1}\\n${code}`;\n      const buildScene = ([n, attrs, code]) =>\n        `// JS scene ${n + 1}\\n\"${n}\": function () { ${code} }`;\n\n      return {\n        name: \"script.js\",\n        language: \"js\",\n        code: `// module ${moduleName} (ES6)\n          ${imports.map(buildImport).join(\"\\n\")}\n          export function Program ({connectStore}) {\n            ${definitions.map(buildDefn).join(\"\\n\")}\n            return ({\n              ${scenes.map(buildScene).join(\",\\n\")}\n            })\n          }\n          export function mount (mountpoint, initial) {\n            let Store = {\n              root: Object.assign({}, initial),\n            };\n            const connectStore = (root = \"root\") => ({\n                get: (key) => Store[root][key],\n            })\n            const program = Program({connectStore})\n            return (n, container) => {\n              program[n-1].call(container)\n            }\n          }\n        `,\n      };\n    },\n  });\n}\n\nfunction classifyJavascript(code) {\n  const keywordToType = {\n    function: \"function\",\n    const: \"constant\",\n    var: \"variable\",\n    let: \"variable\",\n  };\n  const defnMatch = code.match(jsDefnRegex);\n  if (defnMatch) {\n    return {\n      mode: \"define\",\n      definitions: [\n        {\n          name: defnMatch[2],\n          type: keywordToType[defnMatch[1]],\n        },\n      ],\n    };\n  } else {\n    return { mode: \"eval\" };\n  }\n}\n\nfunction buildImport(spec) {\n  if (spec.expose) {\n    const list =\n      spec.expose === \"*\" ? spec.expose : \"{ \" + spec.expose.join(\", \") + \" }\";\n    const maybeDefault = spec.as ? spec.as + \", \" : \"\";\n\n    return `import ${maybeDefault}${list} from '${spec.from}'`;\n  }\n\n  if (spec.as) {\n    return `import ${spec.as} from '${spec.from}'`;\n  }\n\n  return `import '${spec.from}'`;\n}\n\n\n//# sourceURL=webpack://@cre.ative/kram-express-webpack/./src/web-standard-plugin.js?");

/***/ }),

/***/ "./src/webpack.js":
/*!************************!*\
  !*** ./src/webpack.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"packager\": () => (/* binding */ packager)\n/* harmony export */ });\n/* harmony import */ var webpack__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webpack */ \"webpack\");\n/* harmony import */ var webpack__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webpack__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _cre_ative_kram__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @cre.ative/kram */ \"@cre.ative/kram\");\n/* harmony import */ var _cre_ative_kram__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_cre_ative_kram__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _configure__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./configure */ \"./src/configure.js\");\n/* harmony import */ var _web_standard_plugin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./web-standard-plugin */ \"./src/web-standard-plugin.js\");\n/* harmony import */ var _web_standard_plugin__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_web_standard_plugin__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\n\nasync function packager(options) {\n  const { platforms } = options;\n\n  const defaultPlugin = _cre_ative_kram__WEBPACK_IMPORTED_MODULE_1___default().register((_web_standard_plugin__WEBPACK_IMPORTED_MODULE_3___default()));\n  const plugins = platforms ? await registerPlugins(platforms) : [];\n  const webpack_config = (0,_configure__WEBPACK_IMPORTED_MODULE_2__.configure)({\n    plugins: [defaultPlugin, ...plugins],\n    ...options,\n  });\n  console.log(\"Webpack Configuration:\", jsonpp(webpack_config));\n\n  return webpack__WEBPACK_IMPORTED_MODULE_0___default()(webpack_config);\n}\n\nasync function registerPlugins(platforms) {\n  const allPlatforms = Object.entries(platforms).map(([name, moduleName]) =>\n    import(/* webpackIgnore: true */ moduleName)\n      .then((mod) => _cre_ative_kram__WEBPACK_IMPORTED_MODULE_1___default().register(mod.default, name))\n      .catch((err) =>\n        console.log(\"Failed to load Kram plugin:\", name, moduleName, err)\n      )\n  );\n\n  return Promise.allSettled(allPlatforms).then((results) =>\n    results.filter((r) => r.status === \"fulfilled\").map((r) => r.value)\n  );\n}\n\nfunction jsonpp(obj) {\n  const replacer = (_, s) => {\n    if (typeof s === \"function\") {\n      return { \"[Function]\": s.displayName || s.name };\n    } else if (s instanceof RegExp) {\n      return { \"[RegExp]\": s.source };\n    } else {\n      return s;\n    }\n  };\n\n  return JSON.stringify(obj, replacer, \"  \");\n}\n\n\n//# sourceURL=webpack://@cre.ative/kram-express-webpack/./src/webpack.js?");

/***/ }),

/***/ "./src/workbook.js":
/*!*************************!*\
  !*** ./src/workbook.js ***!
  \*************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const path = __webpack_require__(/*! path */ \"path\");\nconst fs = __webpack_require__(/*! fs */ \"fs\");\nconst Kr = __webpack_require__(/*! @cre.ative/kram */ \"@cre.ative/kram\");\n\nconst kramExt = (id) => `${id}.md`;\n\nfunction asyncParse(filepath, basename) {\n  return new Promise((resolve, reject) => {\n    fs.readFile(filepath, \"utf8\", (err, data) => {\n      if (err) {\n        reject(err);\n      } else {\n        try {\n          const workbook = Kr.parse(data, basename);\n          resolve(workbook);\n        } catch (err) {\n          reject(err);\n        }\n      }\n    });\n  });\n}\n\nfunction getById(store, req, res) {\n  const { prjId, wbkId } = req.params;\n  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));\n\n  asyncParse(filepath, wbkId)\n    .then((workbook = res.status(200).json(workbook)))\n    .catch((error) => res.status(500).send(error));\n}\n\nfunction update(store, req, res) {\n  const { prjId, wbkId } = req.params;\n  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));\n  const wb = req.body;\n\n  fs.writeFile(filepath, Kr.pack(wb), (err) => {\n    if (err) {\n      res.status(500).send(err);\n    } else {\n      res.status(200).send();\n    }\n  });\n}\n\nfunction updateScene(store, req, res) {\n  const { prjId, wbkId, scnId } = req.params;\n  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));\n  const json = req.body;\n\n  fs.readFile(filepath, \"utf8\", (err, data) => {\n    if (err) {\n      res.status(500).send(err);\n    } else {\n      let wb = Kr.parse(data, wbkId, (wb) => {\n        const scenes = wb.scenes;\n        scenes[scnId] = json;\n        return Object.assign({}, wb, { scenes });\n      });\n\n      fs.writeFile(filepath, Kr.pack(wb), (err) => {\n        if (err) {\n          res.status(500).send(err);\n        } else {\n          res.status(200).json({\n            moduleName: wb.moduleName,\n            scenes: { [scnId]: wb.scenes[scnId] },\n            modules: wb.modules,\n          });\n        }\n      });\n    }\n  });\n}\n\nmodule.exports = {\n  getById,\n  update,\n  updateScene,\n};\n\n\n//# sourceURL=webpack://@cre.ative/kram-express-webpack/./src/workbook.js?");

/***/ }),

/***/ "@cre.ative/kram":
/*!**********************************!*\
  !*** external "@cre.ative/kram" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@cre.ative/kram");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ "html-webpack-plugin":
/*!**************************************!*\
  !*** external "html-webpack-plugin" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("html-webpack-plugin");

/***/ }),

/***/ "webpack":
/*!**************************!*\
  !*** external "webpack" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("webpack");

/***/ }),

/***/ "webpack-dev-middleware":
/*!*****************************************!*\
  !*** external "webpack-dev-middleware" ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("webpack-dev-middleware");

/***/ }),

/***/ "webpack-hot-middleware":
/*!*****************************************!*\
  !*** external "webpack-hot-middleware" ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("webpack-hot-middleware");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.js");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;