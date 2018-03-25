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

if (cli.command === "hey")
{
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
else if (cli.command === "huh")
{
    cli.info("Running `huh`");

    (async () => {
      let scrapper = new Scrapper()

      if (false) {
        let links = await scrapper.scrapeZtDlProtect(
          'https://www.dl-protect1.com/1234556001234556021234556101234556150x9xd04kaitk')
        console.log(links)
      }

      if (true) {
        let results = await scrapper.scrapeZtPostPage(
          'https://ww1.zone-telechargement1.com/3105-game-of-thrones-saison-3-french-hd720.html')
          .then(async (meta) => {
            logger.info(`\` Release: ${meta.relaseName}`)
            for(const section of meta.results) {
              if (section.name === 'uptobox' || section.name === '1fichier') {
                logger.info(` \` Processing section ${section.name}`)
                for(const link of section.links) {
                  logger.info(`   \` - ${link.label} : ${link.links.join(' ; ')}`)
                  for (const lnk of link.links) {
                    const meta = await scrapper.scrapeZtDlProtect(lnk)
                    logger.info(`   \` - ${link.label} : ${meta.links.join(' ; ')}`)
                  }
                }
              }
              else {
                logger.info(` \` Skipping section ${section.name}`)
              }
            }

            return 'TODO'
          })
        console.log(results)
      }

      logger.info("hey: waiting for user to close tha browser.")
      await scrapper.waitForBrowserDisconnect()
    })()
    .finally( async () => {
      logger.info("hey: done.")
    });
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

(async () => {
  await Sleep(100, `EOS: ${__filename}`)
})();

cli.info('EOS')
