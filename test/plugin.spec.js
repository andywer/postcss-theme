'use strict'

import fs from 'fs'
import path from 'path'

import { expect } from 'chai'
import postcss from 'postcss'

import themePlugin from '../index'

const CSS_INPUT_FILE = path.join(__dirname, 'css/test.css')

function normalizeString (string) {
  return string.split('\n').map(line => line.trim()).join('')
}

function realpath (filePath) {
  return fs.realpathSync(path.join(__dirname, filePath))
}

describe('postcss-theme', () => {
  let cssOutput

  it('runs successfully', () => {
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

  it('uses a given themeFileResolver method', () => {
    function themeFileResolver (themeFilePath, options, defaultResolver, source) {
      expect(source.input.file).to.equal(CSS_INPUT_FILE)

      const themePath = __dirname + '/css/themes/default'
      return defaultResolver(themeFilePath + options.suffix, { themePath })
    }

    return postcss([
      themePlugin({ themeFileResolver, suffix: '-test' })
    ])
    .process(fs.readFileSync(CSS_INPUT_FILE), { from: CSS_INPUT_FILE, to: path.basename(CSS_INPUT_FILE) })
    .then(function (result) {
      const firstOutputLine = result.css.split('\n')[ 0 ]
      const expectedPath = realpath('./css/themes/default') + '/colors-test.css'

      expect(firstOutputLine).to.equal(`@value black, white from "${expectedPath}";`)
    })
  })
})
