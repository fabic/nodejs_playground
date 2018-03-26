
/* @ flow */

'use strict'

import ScrapperBase from './Scrapper'

import     sleep from '../../misc/sleep'
import    logger from '../../misc/logger'

import    assert from 'assert'
import puppeteer from 'puppeteer'
import         _ from 'lodash'


/**
 * LDLC.Fr scrapper
 */
export default class LDLCScrapper extends ScrapperBase
{
  constructor() {
    super()
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * Scrape products list page.
   *
   * @returns {Promise<[]>}
   */
  scrapeLdlcProductsList(url)
  {
    return new Promise(async (resolve, reject) => {
      if (this.browser == null)
        await this.launchBrowser()

      const page = await this.browser.newPage()
      await page.setViewport({width: 1280, height: 1024})
      await page.goto(url)

      let allResults = []

      let       iterCount = 1
      const maxIterations = 2

      while (true) {
        logger.info(`~~> ITERATION #${iterCount}`)

        const result = await page.evaluate(function _fetch_articles() {
          console.assert(this instanceof Window)

          let articles = Array.from(
            document.querySelectorAll("a.nom[href^='https://www.ldlc.com/fiche/']"),
            (a) => {
              return {
                 href: a.href,
                title: a.title
              }
            })

          let nextPageLink = document.querySelectorAll("a.pagerNextItem[rel=next]")

          return {
            articles,
            href:        document.location.href,
            hasNextPage: nextPageLink.length === 1,
            hasError:    nextPageLink.length > 1
          }
        }); // page.evaluate() //

        allResults.push(result)

        // console.log(result);

        if (result.hasError) {
          logger.error(" \` Oops! result may have some error(s) [BREAK].")
          break
        }
        else if (!result.hasNextPage) {
          logger.info(" \` Reached last page, ok [BREAK]")
          break
        }

        iterCount++
        if (iterCount > maxIterations) {
          logger.warn(` \`~~> REACHED MAXIMUM ITERATION COUNT (${iterCount}) [BREAK]`)
          break
        }

        logger.info(` \`~~> NEXT ITERATION (${iterCount})`)

        await do_pause_for_a_while(200 + Math.floor(Math.random() * 300))

        //await page.click("a.pagerNextItem[rel=next]")
        // ^ https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageclickselector-options
        //   The correct pattern for click'n'wait :
        const nextPageSelectorStr = "a.pagerNextItem[rel=next]";
        const [httpResponse] = await Promise.all([
          page.waitForNavigation(/* waitOptions */ {}),
          page.click(nextPageSelectorStr, /* clickOptions */ {}),
        ]);

        logger.info(" \` Click'n'wait done.")
        // console.log(httpResponse)

        logger.info(" \` - - -")
        logger.info("")

      } // while(true) //

      resolve(allResults)

      // await do_pause_for_a_while( 5000 )
      // await browser.close()
      // ^ We ain't closing the browser, leaving it open for any further calls.
    }) // Promise() //
      // Normalize results into one flat array.
      .then((results) => {
        logger.info("Scrapper completed")
        let retv = []
        for (let obj of results) {
          retv.push(...obj.articles)
        }
        return retv
      })

  } // scrapeLdlcProductsList() //

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * Scrape a product page.
   *
   * @returns {Promise<[]>}
   */
  scrapeProductPage(url)
  {
    const _startMsecs = Date.now()

    const          reuseLastPage = true
    const shallInterceptRequests = false

    return new Promise(async (resolve, reject) => {
      this.logger.info(`Scraping product page at ${url}`)

      if (this.browser == null)
        await this.launchBrowser()

      let page = null

      // New page (slower)
      if (! reuseLastPage) {
        page = await this.browser.newPage()
        await page.setViewport({width: 1366, height: 768})
        if (shallInterceptRequests) {
          await page.setRequestInterception(true);
          page.on('request', (request) => {
            const url = request.url()
            const ext = url.substr(url.length - 3) // fixme: lazy, shall also handle QS.
            this.logger.info(` \` Page request: ${url}   [EXT: ${ext}]`)
            if (ext in {jpg: 0, png: 0, gif: 0, svg: 0}) {
              this.logger.info(`   \` Aborting request for ${url}  [IMAGE]`)
              request.abort()
            }
            else
              request.continue();
          });
        }
      }
      // Reuse last open page (much faster).
      else {
        const pages = await this.browser.pages()
        assert(pages.length > 0)
        page = pages[ pages.length - 1 ]
      }

      await page.goto( url )

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

      const result = await page.evaluate(function _fetch_product_details() {
        console.assert(this instanceof Window)

        const specs = Array.from(
          document.querySelectorAll(
            "table#productParametersList tr"),
          (tr) => {
            return [
              tr.cells[0].innerText.trim(),
              tr.cells[1].innerText.trim()
            ]
          })

        const specs2 = new Map(specs)

        // todo: find out if we can easily get an object from a Map.
        const specs3 = {}
        specs2.forEach((v,k) => {
          // const key = _.snakeCase(k)
          // const key = scr4p.lodash.snakeCase(k)
          const key = k
          specs3[key] = v
        })

        const productName = document.querySelectorAll(
          "#productheader .designation_courte")[ 0 ]
          .innerText.trim()

        const productHeading = document.querySelectorAll(
          "#productheader .designation_longue")[ 0 ]
          .innerText.trim()

        const priceElt = document.querySelectorAll("#productshipping .price.sale")[0]
        const priceTaxElt = priceElt.nextSibling
        const productPrice = `${priceElt.innerText.trim()} (${priceTaxElt.innerText.trim()})`

        return {
          specs:    specs3,
          href:     document.location.href,
          name:     productName,
          heading:  productHeading,
          price:    productPrice,
          hasError: false // todo?
        }
      }); // page.evaluate() //

      // Leave newly opened pages open for some time, then close these.
      if (! reuseLastPage) {
        setTimeout(async () => {
          this.logger.info(`(Closing page '${page.url()}').`)
          await page.close()
        }, 3*10 * 1000) // 3 secs/page times 10 pages ~= 30 secs.
      }

      resolve(result)
    }) // Promise() //
      // todo: ~~Normalize results~~ like re-mapping with our own key names? here?
      // Compute the elapsed time.
      .then((result) => {
        result._specs = {}
        _.forEach(result.specs, (v, k) => {
          const key = _.snakeCase( k )
          result._specs[ key ] = v
        })

        result._elaps = Math.round((Date.now() - _startMsecs) / 100) / 10

        logger.info(`Scrapper done with '${result.href}, elaps: ${result._elaps} secs.'`)
        logger.info(" \` - - -")
        logger.info("")

        return result
      })
  } // scrapeProductPage() //

} // LDLCScrapper class //

// EOF //
