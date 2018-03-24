#!/usr/bin/env node

/* @ flow */

'use strict'

const assert = require('assert')
const cli    = require('cli')
import logger from 'winston'
import puppeteer from 'puppeteer'
import _ from 'lodash'

import Config from '../../config'

cli.info("HEY!")

cli.enable('status')
cli.parse({
    file: [ 'f', 'A file to process', 'file', null ],
    time: [ 't', 'An access time', 'time', false],
    work: [ false, 'What kind of work to do', 'string', 'sleep' ],
}, ['hey', 'huh'])

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Modern ES6+ way of pausing javascript code.  Returns a Promise, completion
 * of which one can `await`.
 *
 * Usage: `await sleep_promise(5*1000)`
 *
 * @link https://stackoverflow.com/a/39914235/643087
 * @param ms {number}
 * @returns {Promise<any>}
 */
function sleep_promise(ms) {
  return new Promise(resolve => setTimeout(
    () => { resolve(ms) }, ms))
}

/**
 * Wrapper aroung `sleep_promise()` that issues informational messages.
 *
 * @param msecs
 * @returns {Promise<any>}
 */
function do_pause_for_a_while( msecs = 500 )
{
  cli.info(`Waiting for ${msecs} milliseconds (${Math.floor(msecs/1000)} seconds).`)
  return sleep_promise( msecs )
    .then((ms) => {
      cli.info(` \` Done sleeping ${ms} milliseconds.`)
      return ms
    })
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 *
 * @constructor
 */
function LDLCScrapper(logger = null) {
  this.logger = logger || require('winston')
  this.browser = null
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Launch a browser and set `this.browser`.
 *
 * @returns {Promise<Puppeteer.Browser>}
 */
LDLCScrapper.prototype.launchBrowser = function _ldlcScrapper_launch_browser()
{
  return puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome-unstable',
    userDataDir: '/home/fabi/.config/google-chrome-tmp',
    // slowMo: 300, // milliseconds
    dumpio: true,
    devtools: false,
  })
    .then((browser) => {
      this.logger.info("We got a browser launched.")
      assert(this.browser == null)
      this.browser = browser
      return browser
    })
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/** Convenience method for having the process wait for the user to close the
 * browser, instead of exiting blindly at end-of-script.
 *
 * @returns {Promise<any>}
 */
LDLCScrapper.prototype.waitForBrowserDisconnect =
  function _ldlcScrapper_wait_for_browser_disconnect()
  {
    assert(this.browser != null)
    return new Promise((resolve, reject) => {
      this.logger.info("Will wait for browser to close/disconnect.")
      this.browser.on('disconnected', () => {
        const message = "Browser disconnected, probably ok.";
        logger.info(`${message}  [LDLCScrapper.waitForBrowserDisconnect()]`)
        //reject(new Error(message))
        resolve()
      })
    })
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Scrape something.
 *
 * @returns {Promise<[]>}
 */
LDLCScrapper.prototype.scrapeIt = function _ldlcScrapper_scrape_it(url)
{
  return new Promise( async (resolve, reject) => {
    if (this.browser == null)
      await this.launchBrowser()

    const page = await this.browser.newPage()
    await page.setViewport({width: 1280, height: 1024})
    await page.goto(url)

    let   allResults    = []

    let   iterCount     = 1
    const maxIterations = 20

    while(true)
    {
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
          href: document.location.href,
          hasNextPage: nextPageLink.length === 1,
          hasError: nextPageLink.length > 1
        }
      }); // page.evaluate() //

      allResults.push(result)

      // console.log(result);

      if (result.hasError) {
        logger.error(" \` Oops! result may have some error(s) [BREAK].")
        break
      }
      else if (! result.hasNextPage) {
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

    resolve( allResults )

    // await do_pause_for_a_while( 5000 )
    // await browser.close()
    // ^ We ain't closing the browser, leaving it open for any further calls.
  }) // Promise() //
    // Normalize results into one flat array.
    .then((results) => {
      logger.info("Scrapper completed")
      let retv = []
      for(let obj of results) {
        retv.push(...obj.articles)
      }
      return retv
    })

} // _ldlcScrapper_scrape_it() //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Scrape a product page.
 *
 * @returns {Promise<[]>}
 */
LDLCScrapper.prototype.scrapeProductPage =
  function _ldlcScrapper_scrape_product_page(url)
  {
    const _startMsecs = Date.now()

    const          reuseLastPage = true
    const shallInterceptRequests = false

    return new Promise(async (resolve, reject) => {
      logger.info(`Scraping product page at ${url}`)

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

      const result = await page.evaluate(async function _fetch_product_details() {
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
  } // _ldlcScrapper_scrape_procuct_page() //

// - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - -

if (cli.command === "hey") {
    cli.info("Hey! puppeteer!");

    logger.info("Default arguments: " + puppeteer.defaultArgs().join(' '));

    (async () => {
      let scrapper = new LDLCScrapper()

      if (false) {
        await scrapper.scrapeIt('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
          .then((result) => {
            logger.info("hey: done, got our motherboards.")
            console.log(result)
          })
          .finally(async () => {
            logger.debug("hey: done, finally.")
          })

        await scrapper.scrapeIt('https://www.ldlc.com/informatique/pieces-informatique/carte-graphique-interne/c4684/')
          .then((result) => {
            logger.info("hey: done, got those GPUs")
            console.log(result)
          })
      }

      if (false) {
        const products = await scrapper.scrapeIt('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
          .then(async (products) => {
            logger.info("hey: done, got those products (#{products.length}), will now fetch details")
            let index = 0
            for (let item of products) {
              index++
              logger.info(` \` #${index}/${products.length} : ${item.title}  ${item.href}`)
              let details = await scrapper.scrapeProductPage(item.href)
              item.details = details
              logger.info(` ^ #${index}/${products.length} : ${item.details._elaps} seconds.`)
              console.log(item)
            }
            return products
          })
          .then((products) => {
            logger.info("hey: completed ok")
            console.log(products)
          })
      }

      if (true) {
        let details = await scrapper.scrapeProductPage('https://www.ldlc.com/fiche/PB00242064.html')
        console.log(details)
      }

      logger.info("hey: waiting for user to close tha browser.")
      await scrapper.waitForBrowserDisconnect()
    })();
}
else if (cli.command === "huh") {
    cli.info("Running `huh`")
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

cli.info('EOS')
