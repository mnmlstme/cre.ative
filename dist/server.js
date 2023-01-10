#!/usr/bin/env node

/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/server/main.js":
/*!****************************!*\
  !*** ./src/server/main.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\nconst path = __webpack_require__(/*! path */ \"path\")\nconst fs = __webpack_require__(/*! fs */ \"fs\")\nconst yargs = __webpack_require__(/*! yargs/yargs */ \"yargs/yargs\")\n;\nconst { create, publish, start } = __webpack_require__(/*! @cre.ative/kram-express-webpack */ \"@cre.ative/kram-express-webpack\")\nconst { parse } = __webpack_require__(/*! yaml */ \"yaml\")\n\nconst PORT = 3000\nconst args = process.argv.slice(2)\nconst cwd = process.cwd()\nconst options = setup(args)\n\nconsole.log('server options:', options)\n\nif (options.publish) {\n  publish(options)\n}\n\nif (options.serve) {\n  create(options).then((app) => {\n    start(app, options.port || PORT)\n  })\n}\n\nfunction getAppRoot() {\n  let module = '@cre.ative/cre-a-tive'\n  let modulepath = path.join('./node_modules', module)\n\n  if (!fs.existsSync(modulepath)) {\n    module = '@cre.ative/self'\n    modulepath = path.join('./node_modules', module)\n  }\n\n  console.log(`Found Creative app ${module}:`, modulepath)\n  return [module, modulepath]\n}\n\nfunction setup(args) {\n  const argv = yargs(args)\n    .option('dev', {\n      alias: 'd',\n      type: 'boolean',\n      description: 'Run in dev mode, watching for changed files',\n    })\n    .option('hot', {\n      alias: 'h',\n      type: 'boolean',\n      description: \"Enable HMR; implies '--dev'\",\n    })\n    .option('api', {\n      alias: 'a',\n      type: 'boolean',\n      decription: 'Enable Kram API server for client-side editing',\n    })\n    .option('publish', {\n      alias: 'p',\n      type: 'boolean',\n      description: 'Create static website of all projects.',\n    })\n    .option('serve', {\n      alias: 's',\n      type: 'boolean',\n      description: 'Start an HTTP server to serve the projects',\n    })\n    .parse()\n  const { dev, hot, api, publish, serve } = argv\n  const [projectsDir] = argv._\n  const basedir = cwd\n  const pubdir = path.join(basedir, 'docs')\n  const [app, appPath] = getAppRoot()\n  const approot = path.resolve(basedir, appPath)\n  const docroot = path.resolve(basedir, projectsDir || './projects')\n  const indexFile = path.resolve(docroot, './index.yaml')\n  const { projects, platforms } = readIndex(indexFile)\n  const entries = Object.entries(projects)\n    .map(([projId, projPath]) => {\n      const projFile = path.resolve(docroot, projPath, 'project.yaml')\n      const { workbooks } = readProject(projFile)\n\n      return workbooks.map((wb) => path.join(projPath, wb.file))\n    })\n    .flat()\n\n  return {\n    basedir,\n    public: pubdir,\n    docroot,\n    projects,\n    platforms,\n    entries,\n    template: path.join(approot, 'dist', 'templates', 'workbook.html'),\n    app,\n    dev: hot ? 'hmr' : dev,\n    api,\n    publish,\n    serve: serve || api || dev || hot,\n  }\n}\n\nfunction readIndex(filename) {\n  const file = fs.readFileSync(filename, 'utf8')\n\n  console.log('=== Index file ===\\n', file)\n  return Object.assign({}, { projects: [], platforms: {} }, parse(file))\n}\n\nfunction readProject(filename) {\n  const file = fs.readFileSync(filename, 'utf8')\n\n  console.log('=== Project file ===\\n', file)\n  return Object.assign({}, { workbooks: [] }, parse(file))\n}\n\n\n//# sourceURL=webpack://@cre.ative/cre-a-tive/./src/server/main.js?");

/***/ }),

/***/ "@cre.ative/kram-express-webpack":
/*!**************************************************!*\
  !*** external "@cre.ative/kram-express-webpack" ***!
  \**************************************************/
/***/ ((module) => {

module.exports = require("@cre.ative/kram-express-webpack");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "yaml":
/*!***********************!*\
  !*** external "yaml" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("yaml");

/***/ }),

/***/ "yargs/yargs":
/*!******************************!*\
  !*** external "yargs/yargs" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("yargs/yargs");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/server/main.js");
/******/ 	
/******/ })()
;