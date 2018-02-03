'use strict'

let nunjucks = require('nunjucks')

/**
 *
 * @author fabic.net
 * @since 2018-02-03
 */
class Nunjucks extends nunjucks.Environment {
  /**
   * Ctor.
   *
   * @param app
   * @param path
   * @param njkOpts
   *
   * @link https://mozilla.github.io/nunjucks/api.html#constructor
   */
  constructor (app, path, njkOpts) {
    njkOpts = njkOpts || {
      autoescape: true,
      // TODO: install dep. "chokidar" for watch/autoreload ability.
      // watch: true,
      // ^ meanwhile we disabled caching for dev. purposes.
      noCache: true
    }

    let loader = new nunjucks.FileSystemLoader('views', njkOpts)
    super( loader )

    this.express( app )
    app.set('view engine', 'nunjucks')
    app.use(path, Nunjucks.Router())
    app.set('nunjucks', this)
  }

  static Router () {
    let router = require('express').Router()

    router.get(/^.*$/, function(req, res, next) {
      res.render('index.html.njk', {
        title: 'Huh!'
      })
    })

    return router
  }
}

module.exports = function(app, path, njkOpts) {
  return new Nunjucks(app, path, njkOpts)
}
