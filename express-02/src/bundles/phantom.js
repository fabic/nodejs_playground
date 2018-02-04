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

  async Render (url, pdfFileName) {
    pdfFileName = pdfFileName || 'export.pdf'

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

      let fileName = req.query.fn || url

      fileName = fileName.replace(
        /(https?:\/\/|[^A-Za-z0-9_.])/g,
        function (match, m1, offset, string) {
          return '_'
        })

      if (!fileName.endsWith('.pdf')) {
        fileName += '.pdf'
      }

      console.log(url, fileName)

      // Check for error conditions.
      // Min. URL would be 'http://x.y'
      if (url.length < 10) {
        res.render('phantom.html.njk', {
          title: 'Huh!',
          error: `Invalid URL: ${url}`
        })
      }
      // Min. file name would be for ex. 'x.pdf'
      else if (fileName.length < 5) {
        res.render('phantom.html.njk', {
          title: 'Huh!',
          error: `Invalid file name: ${fileName}`
        })
      }

      // todo: filter out QS arg. fn=... from URL.
      phantom
        .Render(url, fileName)
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
