#!/usr/bin/env node

/**
 * `src/app.js`
 *
 * @author fabic.net
 */

// @ flow
//  ^ -_-

let debug            = require('debug')('express-02:server')

const express        = require('express')
const path           = require('path')
const favicon        = require('serve-favicon')

// FIXME: 2 loggers ?
const logger         = require('morgan')
const wlogger        = require('winston')

const cookieParser   = require('cookie-parser')
const bodyParser     = require('body-parser')
const sassMiddleware = require('node-sass-middleware')
const compress       = require('compression')
const cors           = require('cors')
const helmet         = require('helmet')
const opn            = require('opn')

const config = require('../config')

/**
 * The Express App.
 *
 * @type {*|Function}
 */
let app = express()

app.set('app.root_dir', path.join(__dirname, '..'))
app.set('app.public', path.join(app.get('app.root_dir'), 'public'))
app.set('app.host', 'localhost') // FIXME: temp.
app.set('app.logger', wlogger)

// Enable CORS, security, compression, favicon and body parsing
app.use(cors())
app.use(helmet())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(sassMiddleware({
  src: path.join(__dirname, "public"),
  dest: path.join(__dirname, "public"),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}))

app.use(favicon(path.join(app.get('app.public'), 'favicon.ico')))

app.use(express.static(app.get('app.public')))

// --- “BUNDLES” - --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

require('./bundles/nunjucks')(app, '/njk')
require('./bundles/phantom')(app, '/pdf')

// --- ROUTES  --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

app.use("/", require("./routes/index"))

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error("Not Found")
  err.status = 404
  next(err)
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

/**
 * Normalize a port into a number, string, or false.
 */
const port =
  (function _app_js_normalizePort (val) {
    let port = parseInt(val, 10)
    if (isNaN(port)) {
      // named pipe
      return val
    }

    if (port >= 0) {
      // port number
      return port
    }

    return false
  })(process.env.PORT || config.dev.port)

app.set('app.port', port)

wlogger.info('> Starting dev server..')

/* eslint-disable no-console */
const server = app.listen(port)

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

server.on('error',
  /**
   * Event listener for HTTP server "error" event.
   */
  function _app_js_onError (error) {
    if (error.syscall !== 'listen') {
      throw error
    }

    let bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
        break
      default:
        throw error
    }
  })

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

server.on('listening',
  /**
   * Event listener for HTTP server "listening" event.
   */
  function _app_js_onListening () {
    let addr = server.address()
    let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port
    debug('Listening on ' + bind) // FIXME
    wlogger.info('Application started on http://%s:%d', app.get('app.host'),
                                                        app.get('app.port'))
    if (config.dev.autoOpenBrowser) {
      let uri = `http://${app.get('app.host')}:${app.get('app.port')}`
      wlogger.info(`Opening '${uri}' in browser.`)
      opn(uri)
    }
  })

process.on('unhandledRejection', (reason, p) =>
  wlogger.error('(!!) Dude: Unhandled Rejection at: Promise ', p, reason)
)

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

module.exports = {
  app: app,
  close: () => {
    server.close()
  }
}

/* EOF */