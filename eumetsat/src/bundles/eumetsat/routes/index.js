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
  router.get(/^.*$/, async function (req, res, next) {
    let app = req.app

    let eumetsat: EUMetSat = app.get('eumetsat')

    // todo: refactor as part of EUMetSat.
    // todo: ^ done: refactor here now.
    const public_dir = app.get('app.public')
    const imageFiles = Finder.findSync(eumetsat.imagesDirectory, /\.(jpg|png)$/)
      .map((item :Object) => {
        // fixme: dumb impl.
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

    let imagesTypes = {}

    const latestImagesList = imageFiles.filter((item :Object) => {
      const type = item.meta.type +' '+ item.meta.region
      if (type in imagesTypes)
        return false
      imagesTypes[type] = item
      return true
    })

    const videos = await eumetsat.getGeneratedVideos( public_dir )

    res.render('EUMetSat/index.html.njk', {
      title: 'Hello hello ?',
      images_list: imageFiles,
      latest_images_list: latestImagesList,
      videos_list: videos
    })
  })
}