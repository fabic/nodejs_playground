
class ServerSide {
  constructor (app) {
    console.info('Heelloo world ;-')
    ServerSide.SetupNunjucksTemplatingEngine(app)
    app.use('/_', require('./routes/index'))
  }

  /**
   * Nunjucks view engine setup.
   *
   * https://mozilla.github.io/nunjucks/getting-started.html
   * https://mozilla.github.io/nunjucks/api.html#configure
   *
   * @param {Express} app
   * @constructor
   */
  static SetupNunjucksTemplatingEngine (app) {
    let nunjucks = require('nunjucks')
    let path     = require('path')

    nunjucks.configure(path.join(__dirname, 'views'), {
      autoescape: true,
      // TODO: install dep. "chokidar" for watch/autoreload ability.
      // watch: true,
      // ^ meanwhile we disabled caching for dev. purposes.
      noCache: true,
      express: app
    })

    app.set('view engine', 'nunjucks')
  }
}

module.exports = function (app) {
  return new ServerSide(app)
}
