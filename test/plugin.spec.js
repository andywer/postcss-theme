'use strict'

var fs = require('fs')
var path = require('path')

var expect = require('chai').expect
var postcss = require('postcss')

var themePlugin = require('../index')

var CSS_INPUT_FILE = __dirname + '/css/test.css'

function normalizeString (string) {
  return string
    .split('\n')
    .map(function (line) {
      return line.trim()
    })
    .join('')
}

function realpath (filePath) {
  return fs.realpathSync(path.join(__dirname, filePath))
}

describe('postcss-theme', function () {
  let cssOutput

  it('runs successfully', function () {
    return postcss([
      themePlugin({
        themePath: __dirname + '/css/themes/default'
      })
    ])
    .process(fs.readFileSync(CSS_INPUT_FILE), { from: CSS_INPUT_FILE, to: path.basename(CSS_INPUT_FILE) })
    .then(function (result) {
      cssOutput = result.css
    })
  })

  it('produces the expected output', () => {
    expect(normalizeString(cssOutput)).to.equal(normalizeString(`
      @value black, white from "${realpath('./css/themes/default/colors.css')}";

      .test-1 {
        composes: no-borders from "${realpath('./css/themes/default/base-styles.css')}";
        color: black;
      }

      .test-2 {
        color: white;
      }
    `))
  })
})
