
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-stack/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `stack()`.\n\
 */\n\
\n\
module.exports = stack;\n\
\n\
/**\n\
 * Return the stack.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
function stack() {\n\
  var orig = Error.prepareStackTrace;\n\
  Error.prepareStackTrace = function(_, stack){ return stack; };\n\
  var err = new Error;\n\
  Error.captureStackTrace(err, arguments.callee);\n\
  var stack = err.stack;\n\
  Error.prepareStackTrace = orig;\n\
  return stack;\n\
}//@ sourceURL=component-stack/index.js"
));
require.register("component-assert/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var stack = require('stack');\n\
\n\
/**\n\
 * Load contents of `script`.\n\
 *\n\
 * @param {String} script\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function getScript(script) {\n\
  var xhr = new XMLHttpRequest;\n\
  xhr.open('GET', script, false);\n\
  xhr.send(null);\n\
  return xhr.responseText;\n\
}\n\
\n\
/**\n\
 * Assert `expr` with optional failure `msg`.\n\
 *\n\
 * @param {Mixed} expr\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(expr, msg){\n\
  if (expr) return;\n\
  if (!msg) {\n\
    if (Error.captureStackTrace) {\n\
      var callsite = stack()[1];\n\
      var fn = callsite.getFunctionName();\n\
      var file = callsite.getFileName();\n\
      var line = callsite.getLineNumber() - 1;\n\
      var col = callsite.getColumnNumber() - 1;\n\
      var src = getScript(file);\n\
      line = src.split('\\n\
')[line].slice(col);\n\
      expr = line.match(/assert\\((.*)\\)/)[1].trim();\n\
      msg = expr;\n\
    } else {\n\
      msg = 'assertion failed';\n\
    }\n\
  }\n\
\n\
  throw new Error(msg);\n\
};\n\
//@ sourceURL=component-assert/index.js"
));
require.register("visible/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose module.\n\
 */\n\
\n\
module.exports = isVisible;\n\
\n\
/**\n\
 * returns true if `el` is visible.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function isVisible(el){\n\
  return !!(width(el) || height(el)) && el.getAttribute(\"display\") !== \"none\"\n\
}\n\
\n\
/**\n\
 * returns the width of `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Number}\n\
 */\n\
\n\
function width(el){\n\
  return isWindow(el) ? el.innerWidth :\n\
         isDocument(el) ? el.documentElement['scrollWidth'] :\n\
         offset(el).width\n\
}\n\
\n\
/**\n\
 * returns the height of `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Number}\n\
 */\n\
\n\
function height(el){\n\
  return isWindow(el) ? el.innerHeight :\n\
         isDocument(el) ? el.documentElement['scrollHeight'] :\n\
         offset(el).height\n\
}\n\
\n\
/**\n\
 * returns the offset of `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Object}\n\
 */\n\
\n\
function offset(el){\n\
  var obj = el.getBoundingClientRect()\n\
\n\
  return {\n\
    left: obj.left + window.pageXOffset,\n\
    top: obj.top + window.pageYOffset,\n\
    width: Math.round(obj.width),\n\
    height: Math.round(obj.height)\n\
  }\n\
}\n\
\n\
/**\n\
 * is `el` is the window object.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 */\n\
\n\
function isWindow(el){\n\
  return el != null && el == el.window\n\
}\n\
\n\
/**\n\
 * is `el` is a document fragment.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 */\n\
\n\
function isDocument(el){\n\
  return el != null && el.nodeType == el.DOCUMENT_NODE\n\
}\n\
//@ sourceURL=visible/index.js"
));
require.alias("component-assert/index.js", "visible/deps/assert/index.js");
require.alias("component-assert/index.js", "assert/index.js");
require.alias("component-stack/index.js", "component-assert/deps/stack/index.js");
