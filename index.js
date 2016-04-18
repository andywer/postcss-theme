'use strict'

var postcss = require('postcss')
var valueParser = require('postcss-value-parser')

var THEME_FUNCTION_NAME = 'theme'

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
 * @param {object} options { themePath: String }
 */
module.exports = postcss.plugin('postcss-theme', function (options) {
  var themeFileResolver = function (themeFilePath) {
    if (!themeFilePath.match(/\.css$/i)) {
      themeFilePath += '.css'
    }

    return joinPaths(options.themePath, themeFilePath)
  }

  return function (css) {
    if (!options || !options.themePath) {
      throw new Error('No theme path set.')
    }

    css.walk(function (node) {
      if (node.type === 'decl') {
        node.value = transform(node.value, themeFileResolver)
      } else if (node.type === 'atrule') {
        node.params = transform(node.params, themeFileResolver)
      }
    })
  }
})
