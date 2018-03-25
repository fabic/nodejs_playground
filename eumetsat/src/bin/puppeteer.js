#!/usr/bin/env node

/* @ flow */

'use strict'

import Sleep from "../misc/sleep";

const assert = require('assert')
const cli    = require('cli')

import    logger from '../misc/logger'
import puppeteer from 'puppeteer'
import  Scrapper from '../bundles/scrapper'

import Config from '../../config'

logger.info("HUUUUH")

cli.info("HEY!")

cli.enable('status')
cli.parse({
    file: [ 'f', 'A file to process', 'file', null ],
    time: [ 't', 'An access time', 'time', false],
    work: [ false, 'What kind of work to do', 'string', 'sleep' ],
}, ['hey', 'huh'])

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

if (cli.command === "hey") {
    cli.info("Hey! puppeteer!");

    logger.info("Default arguments: " + puppeteer.defaultArgs().join(' '));

    (async () => {
      let scrapper = new Scrapper()

      if (false) {
        await scrapper.scrapeLdlcProductsList('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
          .then((result) => {
            logger.info("hey: done, got our motherboards.")
            console.log(result)
          })
          .finally(async () => {
            logger.debug("hey: done, finally.")
          })

        await scrapper.scrapeLdlcProductsList('https://www.ldlc.com/informatique/pieces-informatique/carte-graphique-interne/c4684/')
          .then((result) => {
            logger.info("hey: done, got those GPUs")
            console.log(result)
          })
      }

      if (false) {
        const products = await scrapper.scrapeLdlcProductsList('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
          .then(async (products) => {
            logger.info("hey: done, got those products (#{products.length}), will now fetch details")
            let index = 0
            for (let item of products) {
              index++
              logger.info(` \` #${index}/${products.length} : ${item.title}  ${item.href}`)
              let details = await scrapper.scrapeLdlcProductPage(item.href)
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
        let details = await scrapper.scrapeLdlcProductPage('https://www.ldlc.com/fiche/PB00242064.html')
        console.log(details)
      }

      logger.info("hey: waiting for user to close tha browser.")
      await scrapper.waitForBrowserDisconnect()
    })()
      .finally( async () => {
        logger.info("hey: done.")
      });
}
else if (cli.command === "huh") {
    cli.info("Running `huh`")
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

(async () => {
  await Sleep(100, `EOS: ${__filename}`)
})();

cli.info('EOS')
