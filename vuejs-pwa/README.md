# fabic-vuejs-pwa

_Personal Vue.js/Webpack/PWA playground (fabic.net)._

* __2018-01-..__
* Based on the [webpack vue.js template](http://vuejs-templates.github.io/webpack/)
* and Feathers.js... (?)
* Entry points:
    - __Server-side:__ `src/server/app.js` :
        * Sets up a "Feathers.js Express app" ;
        * as well as the arcane __Webpack__/whatever logic that gets
          a simple __Vue.js__ example running.  
    - __Client-side:__ `src/client/main.js`
      (see also the __webpack__ configuration `build/webpack.base.conf.js` )

## Features

### Feathers.js

_void_

### Vue.js

_void_

### Nunjucks

* `src/server/other/nunjucks.js`
* __Views:__ under `views/`
    - with a basic Bootstrap v4 layout: `base.html.njk` + `layout.html.njk`.

### Phantom.js PDF generation

* `src/server/other/phantom.js`
* Ex.: `http://localhost:3333/_/pdf/http://google.fr`

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```

```bash
# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

### Tests

```bash
# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the
[guide](http://vuejs-templates.github.io/webpack/)
and [docs for vue-loader](http://vuejs.github.io/vue-loader).
