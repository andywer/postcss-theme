# postcss-theme - Proper theming for PostCSS
[![Build Status](https://travis-ci.org/andywer/postcss-theme.svg?branch=master)](https://travis-ci.org/andywer/postcss-theme)
[![NPM Version](https://img.shields.io/npm/v/postcss-theme.svg)](https://www.npmjs.com/package/postcss-theme)

Super lightweight, straight-forward and written with performance in mind.
Can be used with Webpack, JSPM/System.js or anywhere else where you use
PostCSS!

## What is it able to do?

You have a user interface and a bunch of CSS files / fancy CSS modules
to style it. You want to be able to customize this styling. Let's say you have
this CSS file:

```css
/* header.css */

@value black, white from '../theme/colors.css';

.header {
  composes: menu from '../theme/menu.css';
  background: black;
  color: white;
}


/* ../theme/colors.css */

@value black: #303030;
@value white: #F8F8F8;


/* ../theme/components/menu.css */

.menu {
  box-shadow: 2px 2px 5px;
}
```

We are using the [postcss-modules-values](https://github.com/css-modules/postcss-modules-values)
plugin here, so we can declare variables and import variables from other files
using `@value`.
And we use [postcss-modules-extract-imports](https://github.com/css-modules/postcss-modules-extract-imports)
so we can merge classes from different files into the current class using
`composes: some-other-class from './other-file.css'`.

*But you want to be able to change the styling!* You could just overwrite all these
style rules with your own ones, but that is a lot of work and you must adapt it
everytime these rules change.

So we use **postcss-theme** and do this:

```css
/* header.css */

/* `theme(colors)` will be re-written to `"./path/to/theme/colors.css"` */
@value black, white from theme(colors);

.header {
  /* will be resolved to the file path, too */
  composes: menu from theme(components/menu);
  background: black;
  color: white;
}
```

When configuring the PostCSS plugins in your webpack config or JSPM CSS loader:

```javascript
import themePlugin from 'postcss-theme'

/* postcss plugins: */
[
  themePlugin({ themePath: './path/to/theme-folder' }),
  /* all other plugins go here */
]
```

Ta-da! You are now able to specify the path to the directory containing your
theme's CSS files during your build process. Just change it to a directory
containing another theme if you want to change the styling.


## Installation

```bash
npm install postcss-theme --save
```

## Usage

Just add this plugin to your array of PostCSS plugins and pass it an options
object like `{ themePath: './path/to/theme-folder' }`.

### Webpack

In your webpack config:

```javascript
import theme from 'postcss-theme'

module.exports = {
  module: {
    loaders: [
      {
        test:   /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      }
    ]
  },
  postcss: function () {
    return [
      theme({ themePath: './path/to/theme' }),
      // all other postcss plugins go here
    ]
  }
}
```

### JSPM (jspm-loader-css)

In your css loader file (`css.js`):

```javascript
import { CSSLoader, Plugins } from 'jspm-loader-css'
import theme from 'postcss-theme'

const { fetch, bundle } = new CSSLoader([
  theme({ themePath: './path/to/theme' }),
  Plugins.localByDefault,
  Plugins.extractImports,
  Plugins.scope,
  Plugins.values,
  // or any other postcss plugins
], __moduleName)

export { fetch, bundle }
```

### Vanilla postcss call

```javascript
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import extractImports from 'postcss-modules-extract-imports'
// ...
import theme from 'postcss-theme'

postcss([
  theme({
    themePath: './path/to/theme'
  }),
  extractImports,
  autoprefixer,
  // or whatever plugins you would like to use
]).process(/* ... */)
```


## License

This plugin is released under the terms of the MIT license. See [LICENSE](https://github.com/andywer/postcss-theme/blob/master/LICENSE) for details.
