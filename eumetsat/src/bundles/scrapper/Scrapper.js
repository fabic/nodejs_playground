
/* @ flow */

'use strict'

import     sleep from '../../misc/sleep'
import    logger from '../../misc/logger'

import    assert from 'assert'
import puppeteer from 'puppeteer'
import         _ from 'lodash'


/**
 * Base class providing common features for scrapping stuff out there.
 */
export default class Scrapper
{
  /**
   * Ctor.
   */
  constructor() {
    this.logger = logger
    this.browser = null
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * Launch a browser and set `this.browser`.
   *
   * @returns {Promise<Puppeteer.Browser>}
   */
  launchBrowser() {
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
  waitForBrowserDisconnect() {
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
} // Scrapper class //

// EOF //
