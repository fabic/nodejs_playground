'use strict'

/**
 * Phantom module.
 *
 * @author fabic.net
 * @since 2018-02-02
 */
class Phantom {
  constructor (app, path) {
    app.use(path, Phantom.Router())
    app.set('phantom', this)
    this.phantom = require('phantom')
    console.info('ich bin Phantom !')
  }

  async Render (url) {
    let pdfFileName = 'export.pdf'

    const instance = await this.phantom.create()
    const page     = await instance.createPage()

    await page.property('viewportSize', { width: 1280, height: 1024 })
    const status = await page.open(url)
    console.log(`Page opened with status [${status}].`)

    await page.render(pdfFileName)
    console.log(`File created at [${pdfFileName}]`)

    await instance.exit()

    return pdfFileName
  }

  static Router () {
    let router = require('express').Router()

    /* GET home page. */
    router.get(/^.*$/, function(req, res, next) {
      let app = req.app
      let phantom = app.get('phantom')
      let url = req.url.substr(1)
      console.log(url)
      phantom
        .Render(url)
        .then((pdfFileName) => {
          console.log(pdfFileName)
          // res.attachment(pdfFileName)
          res.sendFile(pdfFileName, {
            root: req.app.get('app.root_dir'),
            dotfiles: 'deny',
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename=${pdfFileName}`
            }
          })
        })
        .catch((huh) => {
          console.warn(huh)
          res.render('phantom.html.njk', {title: 'Huh!'})
        })
    })

    return router
  }
}

module.exports = function(app, path) {
  return new Phantom(app, path)
}
