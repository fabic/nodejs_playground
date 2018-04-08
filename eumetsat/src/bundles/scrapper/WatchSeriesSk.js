
/* @ flow */

'use strict'

import ScrapperBase from './Scrapper'

import     sleep from '../../misc/sleep'
import    logger from '../../misc/logger'

import    assert from 'assert'
import puppeteer from 'puppeteer'
import         _ from 'lodash'
import { Db as MongoDb } from 'mongodb'

/**
 * Scrapper for videos at http://watchseries.sk
 */
export default class WatchSeriesScrapper extends ScrapperBase
{
  constructor(db : MongoDb) {
    super(db)
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * @returns {Promise<{}>}
   */
  scrapeTvShowPage(url)
  {
    const _startMsecs = Date.now()

    return new Promise(async (resolve, reject) => {
      this.logger.info(`Scraping TV show at ${url}`)

      if (this.browser == null)
        await this.launchBrowser()

      const page = await this.browser.newPage()
      await page.setViewport({width: 1366, height: 768})

      // We'll collect URL(s)
      await page.setRequestInterception(true);

      let requestsList = []

      page.on('request', (request) => {
        const url = request.url()
        const ext = url.substr(url.length - 3) // fixme: lazy, shall also handle QS.
        requestsList.push( {url, ext} )
        this.logger.info(` \` Page request: ${url}   [EXT: ${ext}]`)
        request.continue();
      });

      await page.evaluateOnNewDocument(() => {
        console.assert(this instanceof Window)
        const iframes = Array.from(
          document.querySelectorAll("iframe"),
          (iframe) => {
            return {
                  src: iframe.src,
              dataSrc: iframe.getAttribute('data-src')
            }
          })
        iframes.forEach((item) => {
          console.log(`» src: ${item.src}, data-src: ${item.dataSrc}`)
        })

        huh = iframes
      })


      let httpResponse = await page.goto( url )

      const doClickAround = true;
      if (doClickAround) {
        this.logger.info("~~> 1st click")

        let [httpResponse2] = await Promise.all([
          page.waitForNavigation(/* waitOptions */ {}),
          page.click("div#player.jwplayer", /* clickOptions */ {}),
        ]);

        await sleep(300 + Math.floor(Math.random() * 700))

        this.logger.info("~~> 2nd click")
        let [httpResponse3] = await Promise.all([
          page.waitForNavigation(/* waitOptions */ {}),
          page.click("div#player.jwplayer", /* clickOptions */ {}),
        ]);
      }

      // Inject Lodash - https://lodash.com/
      // await page.addScriptTag({
      //   // url: "https://cdn.jsdelivr.net/npm/lodash@4.17.5/lodash.min.js"
      //   path:"node_modules/lodash/lodash.min.js"
      // })

      // await page.exposeFunction('scr4p', () => {
      //   return {
      //     _: _,
      //     lodash: _
      //   }
      // });

      const result = await page.evaluate(function _scrape_tv_show_details() {
        console.assert(this instanceof Window)

        console.log("HEEY ?!")

        return {
          href:     document.location.href,
          hasError: false // todo?
        }
      }); // page.evaluate( _scrape_tv_show_details() ) //

      resolve(result)
    }) // Promise() //
      // todo: ~~Normalize results~~ like re-mapping with our own key names? here?
      // Compute the elapsed time.
      .then((result) => {
        result._elaps = Math.round((Date.now() - _startMsecs) / 100) / 10

        logger.info(`Scrapper done with '${result.href}, elaps: ${result._elaps} secs.'`)
        logger.info(" \` - - -")
        logger.info("")

        return result
      })
  } // scrapeTvShowPage() //

} // WatchSeriesScrapper class //

// EOF //
