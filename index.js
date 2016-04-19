'use strict'

var postcss = require('postcss')
var valueParser = require('postcss-value-parser')

var THEME_FUNCTION_NAME = 'theme'

/**
 * Transforms the CSS: Replaces theme(<file>) statements by actual file paths.
 * @param {string} value
 * @param {function} themeFileResolver
 * @return {string} The transformed `value` param.
 */
function transform (value, themeFileResolver) {
  // Exit condition to improve performance
  if (value.indexOf(THEME_FUNCTION_NAME) === -1) { return value }

  return valueParser(value).walk(function (node) {
    if (node.type === 'function' && node.value === THEME_FUNCTION_NAME) {
      node.type = 'string'
      node.quote = '"'
      node.value = themeFileResolver(valueParser.stringify(node.nodes))
    }
  }, true).toString()
}

// Like path.join(), but will always use '/' as separator, even on Windows.
// See https://github.com/andywer/postcss-theme/issues/1
function joinPaths (path1, path2) {
  return path1 + (path1.match(/\/$/) ? '' : '/') + path2
}

/**
 * Default theme file path resolver. Takes a path and the plugin options,
 * returns the transformed path.
 *
 * @param {string} themeFilePath  As found in the CSS statement `theme(<themeFilePath>)`.
 * @param {object} options
 * @return {string} Transformed themeFilePath.
 */
function defaultThemeFileResolver (themeFilePath, options) {
  if (!options || !options.themePath) {
    throw new Error('No theme path set.')
  }

  if (!themeFilePath.match(/\.css$/i)) {
    themeFilePath += '.css'
  }

  return joinPaths(options.themePath, themeFilePath)
}

/**
 * Plugin definition.
 *
 * @param {object} options { themePath: String, themeFileResolver: Function }
 */
module.exports = postcss.plugin('postcss-theme', function (options) {
  options = options || {}

  // proxy the resolver call, bind the 2nd and 3rd parameter
  var themeFileResolver = function (themeFilePath) {
    var resolver = options.themeFileResolver || defaultThemeFileResolver
    return resolver(themeFilePath, options, defaultThemeFileResolver)
  }

  return function (css) {
    css.walk(function (node) {
      if (node.type === 'decl') {
        node.value = transform(node.value, themeFileResolver)
      } else if (node.type === 'atrule') {
        node.params = transform(node.params, themeFileResolver)
      }
    })
  }
})
