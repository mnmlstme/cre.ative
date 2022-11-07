#!/usr/bin/env node

/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/server/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/server sync recursive":
/*!*************************!*\
  !*** ./src/server sync ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function webpackEmptyContext(req) {\n\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\te.code = 'MODULE_NOT_FOUND';\n\tthrow e;\n}\nwebpackEmptyContext.keys = function() { return []; };\nwebpackEmptyContext.resolve = webpackEmptyContext;\nmodule.exports = webpackEmptyContext;\nwebpackEmptyContext.id = \"./src/server sync recursive\";\n\n//# sourceURL=webpack:///./src/server_sync?");

/***/ }),

/***/ "./src/server/main.js":
/*!****************************!*\
  !*** ./src/server/main.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const path = __webpack_require__(/*! path */ \"path\")\nconst fs = __webpack_require__(/*! fs */ \"fs\")\nconst { create, start } = __webpack_require__(/*! @cre.ative/kram-express-webpack */ \"@cre.ative/kram-express-webpack\")\nconst { parse } = __webpack_require__(/*! yaml */ \"yaml\")\n\nconst PORT = 3000\nconst args = process.argv.slice(2)\nconst cwd = process.cwd()\nconst options = setup(args)\n\nconsole.log('server options:', options)\n\ncreate(options).then((app) => {\n  app.use(['/app', '/app/*'], function (req, res, next) {\n    // all routes send the same HTML\n    const htmlfile = path.join(options.approot, 'index.html')\n    res.sendFile(htmlfile)\n  })\n\n  app.get('/', function (req, res) {\n    res.redirect('/app')\n  })\n\n  start(app, options.port || PORT)\n})\n\nfunction getAppRoot() {\n  const pkg = '@cre.ative/cre-a-tive'\n  let modulepath = path.join('./node_modules', pkg)\n\n  try {\n    console.log(`Looking for ${pkg}`)\n    modulepath = /*require.resolve*/(__webpack_require__(\"./src/server sync recursive\").resolve(pkg))\n    console.log(`Found ${pkg}:`, modulepath)\n  } catch (e) {\n    if (!fs.existsSync(modulepath)) {\n      modulepath = '.'\n    }\n  }\n\n  return path.join(modulepath, 'public')\n}\n\nfunction setup(args) {\n  const [projectsDir] = args\n  const basedir = cwd\n  const approot = path.resolve(basedir, getAppRoot())\n  const docroot = path.resolve(basedir, projectsDir || './projects')\n  const indexFile = path.resolve(docroot, './index.yaml')\n\n  const { projects, platforms } = readIndex(indexFile)\n\n  return {\n    basedir,\n    approot,\n    docroot,\n    projects,\n    platforms,\n  }\n}\n\nfunction readIndex(filename) {\n  const file = fs.readFileSync(filename, 'utf8')\n\n  console.log('=== Index file ===\\n', file)\n  return Object.assign({}, { projects: [], platforms: {} }, parse(file))\n}\n\n\n//# sourceURL=webpack:///./src/server/main.js?");

/***/ }),

/***/ "@cre.ative/kram-express-webpack":
/*!**************************************************!*\
  !*** external "@cre.ative/kram-express-webpack" ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@cre.ative/kram-express-webpack\");\n\n//# sourceURL=webpack:///external_%22@cre.ative/kram-express-webpack%22?");

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

/***/ "yaml":
/*!***********************!*\
  !*** external "yaml" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"yaml\");\n\n//# sourceURL=webpack:///external_%22yaml%22?");

/***/ })

/******/ });