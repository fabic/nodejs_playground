'use strict'

/**
 * Phantom module.
 *
 * @author fabic.net
 * @since 2018-02-02
 */
class Phantom {
  constructor (app, path) {
    app.use(path, this.Router());
    console.info('ich bin Phantom !')
  }

  Router() {
    let router = require('express').Router()
    let path   = require('path')

    /* GET home page. */
    router.get('/', function(req, res, next) {
      res.render(
        path.join(__dirname, 'phantom-pdf.html.njk'),
        { title: 'Phantom PDF export' })
    })

    return router
  }
}

module.exports = function(app, path) {
  return new Phantom(app, path)
};
