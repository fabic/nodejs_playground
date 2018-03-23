#!/usr/bin/env node

/* @ flow */

'use strict'

const assert = require('assert')
const cli    = require('cli')
import logger from 'winston'
import puppeteer from 'puppeteer'

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
function LDLCScrapper() {

}

/**
 * Returns a Promise that resolves once the browser is manually closed by user.
 *
 * @returns {Promise<any>}
 */
LDLCScrapper.prototype.scrapeIt = function _ldlcScrapper_scrape_it()
{
  return new Promise( async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: '/usr/bin/google-chrome-unstable',
      userDataDir: '/home/fabi/.config/google-chrome-tmp',
      slowMo: 300, // milliseconds
      dumpio: true,
      devtools: true,
    })

    browser.on('disconnected', () => {
      cli.info("Browser disconnected.")
      resolve(true)
    })

    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 1024})
    await page.goto('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
    //await page.screenshot({path: 'example.png'})

    let   iterCount     = 1
    const maxIterations = 20
    let   allResults    = []

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

      console.log(result);

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

    // await do_pause_for_a_while( 5000 )
    // await browser.close()
    // ^ We _do_ want to wait for the user to close the browser.
  }) // Promise() //
} // _ldlcScrapper_scrape_it() //

// - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - -

if (cli.command === "hey") {
    cli.info("Hey! puppeteer!");

    logger.info("Default arguments: " + puppeteer.defaultArgs().join(' '));

    (async () => {
      let scrapper = new LDLCScrapper()
      await scrapper.scrapeIt()
      logger.info("hey: done.")
    })();
}
else if (cli.command === "huh") {
    cli.info("Running `huh`")
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

cli.info('EOS')
