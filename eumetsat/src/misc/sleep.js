
'use strict'

import logger from '../misc/logger'

/**
 * Modern ES6+ way of pausing javascript code.  Returns a Promise, completion
 * of which one can `await`.
 *
 * Usage: `await sleep_promise(5*1000)`
 *
 * @constructor
 *
 * @link https://stackoverflow.com/a/39914235/643087
 *
 * @param msecs   {number}
 * @param message {string}
 *
 * @returns {Promise<any>}
 */
export function Sleep(msecs, message = "") {
  return new Promise((resolve) => {
    logger.info(`Sleep: Waiting for ${msecs} milliseconds (${Math.floor(msecs/1000)} seconds).`)
    setTimeout(() => { resolve(msecs) }, msecs)
  })
    .then((ms) => {
      logger.info(`Sleep: \` Done sleeping ${ms} milliseconds.`)
      logger.info(`Sleep:   \` message: ${message}`)
    })
}

export default Sleep
