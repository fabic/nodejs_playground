/** File `src/bundles/eumetsat/routes/index.js`
 *
 * Set up of Express routes, see `EUMetSatApp.Router()`.
 *
 * @flow
 */

import {EUMetSat} from "../index";

/**
 * The index/home page.
 *
 * @param router
 * @constructor
 */
export function IndexPage(router: Function) {
  router.get(/^.*$/, function (req, res, next) {
    let app = req.app

    let eumetsat: EUMetSat = app.get('eumetsat').EUMetSat()

    res.render('EUMetSat/index.html.njk', {
      title: 'Hello hello ?',
      images: [
        // todo...
      ]
    })
  })
}