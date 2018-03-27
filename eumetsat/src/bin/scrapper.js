#!/usr/bin/env node

/* @ flow */

'use strict'

import { LDLCScrapper, ZTScrapper } from '../bundles/scrapper'

import assert from 'assert'
import    cli from 'cli'

import     Sleep from "../misc/sleep";
import    logger from '../misc/logger'
import puppeteer from 'puppeteer'

import     DB from '../bundles/db'
import Config from '../../config'


(async () => {
  cli.info("HEY!")

  cli.enable('status')
  cli.parse({
    file: [ 'f', 'A file to process', 'file', null ],
    time: [ 't', 'An access time', 'time', false],
    work: [ false, 'What kind of work to do', 'string', 'sleep' ],
  }, ['ldlc', 'zt'])

  const dba = new DB(Config.database)
  await dba.connect()

  if (cli.command === "ldlc")
  {
    cli.info("Hey! Running 'ldlc' !");

    let scrapper = new LDLCScrapper(dba.db('fabi'))

    if (true) {
      await scrapper.scrapeProductsList('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
        .then((result) => {
          logger.info("hey: done, got our motherboards.")
          console.log(result)
        })
        .finally(async () => {
          logger.debug("hey: done, finally.")
        })

      await scrapper.scrapeProductsList('https://www.ldlc.com/informatique/pieces-informatique/carte-graphique-interne/c4684/')
        .then((result) => {
          logger.info("hey: done, got those GPUs")
          console.log(result)
        })
    }

    if (false) {
      const products = await scrapper.scrapeProductsList('https://www.ldlc.com/informatique/pieces-informatique/carte-mere/c4293/')
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

    if (false) {
      let details = await scrapper.scrapeProductPage('https://www.ldlc.com/fiche/PB00242064.html')
      console.log(details)
    }

    if (false) {
      const results = await scrapper.navigateFrontpage()
      console.log(results)
    }

    logger.info("hey: waiting for user to close tha browser.")
    await scrapper.waitForBrowserDisconnect()
  } // cli command 'ldlc'

  else if (cli.command === "zt")
  {
    cli.info("Running `zt`");

    let scrapper = new ZTScrapper()

    if (false) {
      let links = await scrapper.scrapeDlProtectedLinks(
        'https://www.dl-protect1.com/1234556001234556021234556101234556150x9xd04kaitk')
      console.log(links)
    }

    if (false) {
      let results = await scrapper.scrapePostPage(
        'https://ww1.zone-telechargement1.com/3105-game-of-thrones-saison-3-french-hd720.html')
        .then(async (meta) => {
          logger.info(`\` Release: ${meta.relaseName}`)
          for(const section of meta.results) {
            if (section.name === 'uptobox' || section.name === '1fichier') {
              logger.info(` \` Processing section ${section.name}`)
              for(const link of section.links) {
                logger.info(`   \` - ${link.label} : ${link.links.join(' ; ')}`)
                for (const lnk of link.links) {
                  const meta = await scrapper.scrapeDlProtectedLinks(lnk)
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

    logger.info("zt: waiting for user to close tha browser.")
    await scrapper.waitForBrowserDisconnect()
  } // cli command 'zt' //

  logger.info("hey: about to close database connection.")
  await dba.closeConnection()
})() // anonymous async IIFE //
  .finally( async () => {
    await Sleep(100, `EOS: Command was ${cli.command}    [${__filename}]`)
  });

// EOF //