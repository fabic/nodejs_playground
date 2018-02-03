'use strict'

require('../../build/check-versions')()

const path          = require('path')
const express       = require('@feathersjs/express')
const feathers      = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const socketio      = require('@feathersjs/socketio')

const favicon  = require('serve-favicon')
const compress = require('compression')
const cors     = require('cors')
const helmet   = require('helmet')
const logger   = require('winston')

const opn             = require('opn')
const webpack         = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')

const config = require('../../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('../../build/webpack.prod.conf')
  : require('../../build/webpack.dev.conf')

const app = express( feathers() )

app.set('app.root_dir', path.join(__dirname, '..', '..') )
// Load app configuration
app.configure(configuration())

// Enable CORS, security, compression, favicon and body parsing
app.use(cors())
app.use(helmet())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(favicon(path.join(app.get('public'), 'favicon.ico')))

/*
 * Nunjucks view engine setup.
 *
 * https://mozilla.github.io/nunjucks/getting-started.html
 * https://mozilla.github.io/nunjucks/api.html#configure
 *
 * @param {Express} app
 * @constructor
 *
 * TODO: remove, unused, replaced by `src/server/other/nunjucks.js`
 */
function SetupNunjucksTemplatingEngine (app) {
  let nunjucks = require('nunjucks')
  let path     = require('path')

  // nunjucks.configure(path.join(__dirname, 'views'), {
  nunjucks.configure('views', {
    autoescape: true,
    // TODO: install dep. "chokidar" for watch/autoreload ability.
    // watch: true,
    // ^ meanwhile we disabled caching for dev. purposes.
    noCache: true,
    express: app
  })

  app.set('view engine', 'nunjucks')
}

function SetupExpressRoutes(app) {
  app.use('/_', require('./routes/index'))
  require('./other/phantom')(app, '/_/pdf')
  require('./other/nunjucks')(app, '/_/nunjucks')
}

// SetupNunjucksTemplatingEngine( app )
SetupExpressRoutes( app )

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false
})

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// Set up Plugins and providers
app.configure(express.rest())
app.configure(socketio())

// Configure other middleware (see `middleware/index.js`)
const middleware = require('./middleware')
app.configure(middleware)

// Set up our services (see `services/index.js`)
const services = require('./services')
app.configure(services)

// Set up event channels (see channels.js)
const channels = require('./channels')
app.configure(channels)

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

// Host the public folder
app.use('/', express.static(app.get('public')))

// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger }))

const appHooks = require('./app.hooks')
app.hooks(appHooks)

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const uri = 'http://localhost:' + port

let _resolve
const readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

/* eslint-disable no-console */
const server = app.listen(port)

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
)

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

module.exports = {
  app: app,
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
