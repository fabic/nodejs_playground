
/* @ flow */

'use strict'

import ScrapperBase from './Scrapper'

import     sleep from '../../misc/sleep'
import    logger from '../../misc/logger'

import    assert from 'assert'
import puppeteer from 'puppeteer'
import         _ from 'lodash'


/**
 * ZT scrapper.
 */
export default class ZTScrapper extends ScrapperBase
{
  constructor() {
    super()
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * ZT : Go through `https://www.dl-protect1.com/123456...`,
   * hit “Continuer” and grab the link(s) to DDL sites.
   *
   * @returns {Promise<{}>}
   */
  scrapeDlProtectedLinks(url)
  {
    const _startMsecs = Date.now()

    return new Promise(async (resolve, reject) => {
      this.logger.info(`ZT: Scraping dl-protected link through ${url}`)

      if (this.browser == null)
        await this.launchBrowser()

      const pages = await this.browser.pages()
      assert(pages.length > 0)
      const page = pages[ pages.length - 1 ]

      await page.goto( url )

      const [httpResponse] = await Promise.all([
        page.waitForNavigation(/* waitOptions */ {}),
        page.click("form > input[type=submit][value='Continuer']", /* clickOptions */ {}),
      ])

      const result = await page.evaluate(async function _fetch_ddl_links() {
        console.assert(this instanceof Window)

        const links = Array.from(
          document.querySelectorAll(
            "a[href^='http']"),
          (anchor) => {
            return anchor.href
          })

        const links2 = links.filter((href) => {
          return href.startsWith( 'http://uptobox.com/')
            || href.startsWith('https://uptobox.com/')
            || href.startsWith( 'http://1fichier.com/')
            || href.startsWith('https://1fichier.com/')
        })

        return {
          links:    links2,
          href:     document.location.href,
          hasError: false
        }
      }); // page.evaluate() //

      resolve(result)
    }) // Promise() //
    // Compute the elapsed time.
      .then((result) => {
        result._elaps = Math.round((Date.now() - _startMsecs) / 100) / 10

        logger.info(`ZT: Scrapper done with '${result.href}, elaps: ${result._elaps} secs.'`)
        logger.info(" \` - - -")
        logger.info("")

        return result
      })
  } // scrapeDlProtectedLinks() //

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * Scrapes a "post" page.
   *
   * @returns {Promise<{}>}
   */
  scrapePostPage(url)
  {
    const _startMsecs = Date.now()

    return new Promise(async (resolve, reject) => {
      this.logger.info(`ZT: Scraping post at ${url}`)

      if (this.browser == null)
        await this.launchBrowser()

      const pages = await this.browser.pages()
      assert(pages.length > 0)
      const page = pages[ pages.length - 1 ]

      // page.setDefaultNavigationTimeout( 55*1000 )

      await page.goto(url, {
        timeout: 50*1000
      } /* options */)

      const result = await page.evaluate(async function _fetch_post_details() {
        console.assert(this instanceof Window)

        const _postinfo = document.querySelectorAll("div.postinfo")
        const postinfo = _postinfo[0]

        const results = []

        const PIC = postinfo.children

        for(const Child of PIC)
        {
          if (Child instanceof HTMLBRElement) {
            continue
          }

          results.push({
            label: Child.innerText.toLowerCase().trim(),
            links: Array.from(
              Child.querySelectorAll("a[href^='http']"),
              (anchor) => { return anchor.href })
          })
        }

        return {
          results:  results,
          href:     document.location.href,
          hasError: _postinfo.length !== 1 // no more than one div.postinfo
          || PIC.length < 3  // and div.postinfo shall have some elements.
        }
      }); // page.evaluate( _fetch_post_details() ) //

      resolve(result)
    }) // Promise() //
    // Post-process results ;
    // Compute the elapsed time.
      .then((meta) => {
        meta.releaseName = meta.results.shift().label

        let sections = []
        let section = {
          name: "<< VOID >>",
          links: []
        }

        for (let i = 0; i < meta.results.length; i++)
        {
          const item = meta.results[ i ]

          assert(item.label !== '')

          if (item.links.length < 1) {
            if (section.links.length > 0)
              sections.push( section )
            section = {
              name: item.label,
              links: []
            }
          }
          else {
            section.links.push( item )
          }
        }

        delete meta.results

        meta.results = sections

        meta._elaps = Math.round((Date.now() - _startMsecs) / 100) / 10

        logger.info(`Scrapper done with '${meta.href}, elaps: ${meta._elaps} secs.'`)
        logger.info(" \` - - -")
        logger.info("")

        return meta
      })
  } // scrapePostPage() //

} // ZTScrapper class //

// EOF //
