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

require('./bundles/nunjucks')(app, '/njk')
require('./bundles/phantom')(app, '/pdf')

app.use("/", require("./routes/index"))

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

const port = process.env.PORT || config.dev.port

console.log('> Starting dev server...')

/* eslint-disable no-console */
const server = app.listen(port)

process.on('unhandledRejection', (reason, p) =>
  wlogger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  wlogger.info('Application started on http://%s:%d', app.get('app.host'), port)
)

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

// module.exports = {
//   app: app,
//   close: () => {
//     server.close()
//   }
// }

module.exports = app