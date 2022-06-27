(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/api.js":
/*!********************!*\
  !*** ./src/api.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const workbook = __webpack_require__(/*! ./workbook */ \"./src/workbook.js\");\n\nfunction mount(app, store) {\n  //  app.get('/api/projects', project.list)\n  //  app.get('/api/projects/:id', project.getById)\n  //  app.post('/api/projects', project.create)\n  //  app.put('/api/projects/:id', project.update)\n  //  app.post('/api/projects/:prjId/workbooks', workbook.create)\n\n  app.get(\"/api/projects/:prjId/workbooks/:wbkId\", (req, res) =>\n    workbook.getById(store, req, res)\n  );\n  app.put(\"/api/projects/:prjId/workbooks/:wbkId\", (req, res) =>\n    workbook.update(store, req, res)\n  );\n  app.put(\"/api/projects/:prjId/workbooks/:wbkId/scenes/:scnId\", (req, res) =>\n    workbook.updateScene(store, req, res)\n  );\n}\n\nmodule.exports = { mount };\n\n\n//# sourceURL=webpack:///./src/api.js?");

/***/ }),

/***/ "./src/configure.js":
/*!**************************!*\
  !*** ./src/configure.js ***!
  \**************************/
/*! exports provided: configure */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"configure\", function() { return configure; });\nconst path = __webpack_require__(/*! path */ \"path\");\nconst webpack = __webpack_require__(/*! webpack */ \"webpack\");\n\nfunction configure(options) {\n  const { basedir, approot, docroot, platforms, entry } = options;\n  const moduledir = path.resolve(basedir, \"./node_modules\");\n  const kramdir = path.resolve(basedir, \"./kram_modules\");\n  const projdir = path.resolve(basedir, \"./projects\");\n\n  return {\n    name: \"dev-server\",\n    context: basedir,\n    entry: {\n      client: [\n        entry || path.resolve(approot, \"./client.js\"),\n        \"webpack-hot-middleware/client.js?path=/__webpack_hmr&timeout=20000\",\n      ],\n    },\n    mode: \"development\",\n    module: {\n      rules: kramRules({ docroot, platforms, kramdir }),\n    },\n    output: {\n      filename: \"[name].bundle.js\",\n      chunkFilename: \"chunk.[id].js\",\n      publicPath: \"/\",\n    },\n    resolve: {\n      alias: {\n        PROJECTS: projdir,\n        DEKRAM: kramdir,\n      },\n      modules: [\"node_modules\"],\n      extensions: [\".js\"],\n      mainFields: [\"browser\", \"main\"],\n    },\n    resolveLoader: {\n      modules: [\"node_modules\"],\n      extensions: [\".js\"],\n      mainFields: [\"loader\", \"main\"],\n    },\n    devServer: {\n      overlay: true,\n      hot: true,\n    },\n    plugins: [new webpack.HotModuleReplacementPlugin()],\n  };\n}\n\nfunction kramRules({ docroot, platforms, kramdir }) {\n  const projectYaml = {\n    test: /\\.yaml$/,\n    include: [docroot],\n    // type: \"json\", // Required by Webpack v4\n    use: \"yaml-loader\",\n  };\n\n  const workbookMd = {\n    test: /\\.md$/,\n    include: [docroot],\n    use: {\n      loader: \"@cre.ative/kram-express-webpack\",\n      options: {\n        platforms,\n        output: kramdir,\n      },\n    },\n  };\n\n  return [projectYaml, workbookMd];\n}\n\n\n//# sourceURL=webpack:///./src/configure.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./server */ \"./src/server.js\");\n\n\nconst PORT = 3000\nconst app = Object(_server__WEBPACK_IMPORTED_MODULE_0__[\"create\"])()\n\nObject(_server__WEBPACK_IMPORTED_MODULE_0__[\"start\"])(app, PORT)\n\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ }),

/***/ "./src/server.js":
/*!***********************!*\
  !*** ./src/server.js ***!
  \***********************/
/*! exports provided: create, start */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"create\", function() { return create; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"start\", function() { return start; });\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var webpack__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webpack */ \"webpack\");\n/* harmony import */ var webpack__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(webpack__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! webpack-dev-middleware */ \"webpack-dev-middleware\");\n/* harmony import */ var webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! webpack-hot-middleware */ \"webpack-hot-middleware\");\n/* harmony import */ var webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _configure__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./configure */ \"./src/configure.js\");\n/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./api */ \"./src/api.js\");\n/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_api__WEBPACK_IMPORTED_MODULE_5__);\n\n\n\n\n\n\n\nfunction create(options) {\n  const app = express__WEBPACK_IMPORTED_MODULE_0___default()();\n  const webpack_config = Object(_configure__WEBPACK_IMPORTED_MODULE_4__[\"configure\"])(options);\n  const compiler = webpack__WEBPACK_IMPORTED_MODULE_1___default()(webpack_config);\n\n  app.use(function (err, req, res, next) {\n    console.error(err.stack);\n    res.status(500).send(\"Something broke!\");\n  });\n\n  app.use(express__WEBPACK_IMPORTED_MODULE_0___default.a.json());\n\n  app.use(\n    // Webpack devserver\n    webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_2___default()(compiler, {\n      // middleware options\n    })\n  );\n\n  app.use(\n    // Webpack HMR devserver\n    webpack_hot_middleware__WEBPACK_IMPORTED_MODULE_3___default()(compiler, {\n      // middleware options\n      log: console.log,\n      path: \"/__webpack_hmr\",\n      heartbeat: 10 * 1000,\n    })\n  );\n\n  const store = Object.assign(\n    {\n      projectDir: \"./projects\",\n      kramDir: \"./kram_modules\",\n    },\n    options\n  );\n\n  Object(_api__WEBPACK_IMPORTED_MODULE_5__[\"mount\"])(app, store);\n\n  return app;\n}\n\nfunction start(app, port = 3000) {\n  app.listen(port, () =>\n    console.log(`Kram server listening at http://localhost:${port}`)\n  );\n}\n\n\n//# sourceURL=webpack:///./src/server.js?");

/***/ }),

/***/ "./src/workbook.js":
/*!*************************!*\
  !*** ./src/workbook.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const path = __webpack_require__(/*! path */ \"path\");\nconst fs = __webpack_require__(/*! fs */ \"fs\");\nconst Kr = __webpack_require__(/*! @cre.ative/kram */ \"@cre.ative/kram\");\n\nconst kramExt = (id) => `${id}.md`;\n\nfunction asyncParse(filepath, basename) {\n  return new Promise((resolve, reject) => {\n    fs.readFile(filepath, \"utf8\", (err, data) => {\n      if (err) {\n        reject(err);\n      } else {\n        try {\n          const workbook = Kr.parse(data, basename);\n          resolve(workbook);\n        } catch (err) {\n          reject(err);\n        }\n      }\n    });\n  });\n}\n\nfunction getById(store, req, res) {\n  const { prjId, wbkId } = req.params;\n  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));\n\n  asyncParse(filepath, wbkId)\n    .then((workbook = res.status(200).json(workbook)))\n    .catch((error) => res.status(500).send(error));\n}\n\nfunction update(store, req, res) {\n  const { prjId, wbkId } = req.params;\n  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));\n  const wb = req.body;\n\n  fs.writeFile(filepath, Kr.pack(wb), (err) => {\n    if (err) {\n      res.status(500).send(err);\n    } else {\n      res.status(200).send();\n    }\n  });\n}\n\nfunction updateScene(store, req, res) {\n  const { prjId, wbkId, scnId } = req.params;\n  const filepath = path.join(store.projectDir, prjId, kramExt(wbkId));\n  const json = req.body;\n\n  fs.readFile(filepath, \"utf8\", (err, data) => {\n    if (err) {\n      res.status(500).send(err);\n    } else {\n      let wb = Kr.parse(data, wbkId, (wb) => {\n        const scenes = wb.scenes;\n        scenes[scnId] = json;\n        return Object.assign({}, wb, { scenes });\n      });\n\n      fs.writeFile(filepath, Kr.pack(wb), (err) => {\n        if (err) {\n          res.status(500).send(err);\n        } else {\n          res.status(200).json({\n            moduleName: wb.moduleName,\n            scenes: { [scnId]: wb.scenes[scnId] },\n            modules: wb.modules,\n          });\n        }\n      });\n    }\n  });\n}\n\nmodule.exports = {\n  getById,\n  update,\n  updateScene,\n};\n\n\n//# sourceURL=webpack:///./src/workbook.js?");

/***/ }),

/***/ "@cre.ative/kram":
/*!**********************************!*\
  !*** external "@cre.ative/kram" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@cre.ative/kram\");\n\n//# sourceURL=webpack:///external_%22@cre.ative/kram%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ }),

/***/ "webpack":
/*!**************************!*\
  !*** external "webpack" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"webpack\");\n\n//# sourceURL=webpack:///external_%22webpack%22?");

/***/ }),

/***/ "webpack-dev-middleware":
/*!*****************************************!*\
  !*** external "webpack-dev-middleware" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"webpack-dev-middleware\");\n\n//# sourceURL=webpack:///external_%22webpack-dev-middleware%22?");

/***/ }),

/***/ "webpack-hot-middleware":
/*!*****************************************!*\
  !*** external "webpack-hot-middleware" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"webpack-hot-middleware\");\n\n//# sourceURL=webpack:///external_%22webpack-hot-middleware%22?");

/***/ })

/******/ })));