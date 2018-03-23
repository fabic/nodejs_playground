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
 * @link https://stackoverflow.com/a/39914235/643087
 * @param ms {number}
 * @returns {Promise<any>}
 */
function sleep_promise(ms) {
  return new Promise(resolve => setTimeout(
    () => { resolve(ms) }, ms))
}

/**
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

// - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - -

if (cli.command === "hey") {
    cli.info("Hey! puppeteer!");

    logger.info("Default arguments: " + puppeteer.defaultArgs().join(' '));

    (async () => {
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome-unstable',
        slowMo: 300, // milliseconds
        dumpio: true,
        devtools: true,
      })
      const page = await browser.newPage()
      await page.setViewport({width: 1280, height: 1024})
      await page.goto('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
      //await page.screenshot({path: 'example.png'})

      const result = await page.evaluate(function _fetch_articles() {
        console.log( this )
        let articles = Array.from(
          document.querySelectorAll("a.nom[href^='https://www.ldlc.com/fiche/']"),
          (a) => {
            return {
              href: a.href,
              title: a.title
            }
          })

        return articles
      });

      console.log(result);

      await do_pause_for_a_while( 5000 )

      await browser.close()
    })();
}
else if (cli.command === "huh") {
    cli.info("Running `huh`")
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

cli.info('EOS')
