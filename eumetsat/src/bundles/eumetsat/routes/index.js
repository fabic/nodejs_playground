/** File `src/bundles/eumetsat/routes/index.js`
 *
 * Set up of Express routes, see `EUMetSatApp.Router()`.
 *
 * @flow
 */

import {EUMetSat} from "../index";
import { Finder } from "../../../misc/finder"

/**
 * The index/home page.
 *
 * @param router
 * @constructor
 */
export function IndexPage(router: Function) {
  router.get(/^.*$/, function (req, res, next) {
    let app = req.app

    let eumetsat: EUMetSat = app.get('eumetsat')

    // todo: refactor as part of EUMetSat.
    const public_dir = app.get('app.public')
    const imageFiles = Finder.findSync(eumetsat.imagesDirectory, /\.(jpg|png)$/)
      .map((item :Object) => {
        item.path = item.path.substr(public_dir.length)
        item.fileName = item.path.substr(item.path.lastIndexOf('/') + 1)

        // Extract metadata from the file name.
        const [_a, _b, type, region, date, ...rest] = item.fileName.split('_', 6)
        item.meta = {
          date: new Date(date),
          type, region, rest,
          _a, _b
        }

        return item
      })
      // Sort files per date-time, newest first.
      .sort((item_a :Object, item_b :Object) => {
        return -(item_a.meta.date.getTime() - item_b.meta.date.getTime())
      })

    res.render('EUMetSat/index.html.njk', {
      title: 'Hello hello ?',
      images_list: imageFiles,
    })
  })
}