
/**
 * Expose module.
 */

module.exports = isVisible;

/**
 * returns true if `el` is visible.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api public
 */

function isVisible(el){
  return !!(width(el) || height(el)) && el.getAttribute("display") !== "none"
}

/**
 * returns the width of `el`.
 *
 * @param {Element} el
 * @return {Number}
 */

function width(el){
  return isWindow(el) ? el.innerWidth :
         isDocument(el) ? el.documentElement['scrollWidth'] :
         offset(el).width
}

/**
 * returns the height of `el`.
 *
 * @param {Element} el
 * @return {Number}
 */

function height(el){
  return isWindow(el) ? el.innerHeight :
         isDocument(el) ? el.documentElement['scrollHeight'] :
         offset(el).height
}

/**
 * returns the offset of `el`.
 *
 * @param {Element} el
 * @return {Object}
 */

function offset(el){
  var obj = el.getBoundingClientRect()

  return {
    left: obj.left + window.pageXOffset,
    top: obj.top + window.pageYOffset,
    width: Math.round(obj.width),
    height: Math.round(obj.height)
  }
}

/**
 * is `el` is the window object.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isWindow(el){
  return el != null && el == el.window
}

/**
 * is `el` is a document fragment.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isDocument(el){
  return el != null && el.nodeType == el.DOCUMENT_NODE
}
