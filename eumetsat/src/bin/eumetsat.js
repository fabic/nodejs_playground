#!/usr/bin/env node

/* @flow */

'use strict'

const assert = require('assert')
const cli    = require('cli')
import logger from 'winston'
//const proc = require('child_process')
import proc from 'child_process'
import NodeTmp from 'tmp'
import FS from 'fs'

import { URL }            from 'url'
import { sep as PATHSEP } from 'path'

import { EUMetSat } from '../bundles/eumetsat'
import Config from '../../config'

cli.info("HEY!")

cli.enable('status')
cli.parse({
    file: [ 'f', 'A file to process', 'file', null ],
    time: [ 't', 'An access time', 'time', false],
    work: [ false, 'What kind of work to do', 'string', 'sleep' ],
}, ['fetch', 'fetch-all', 'encode-all'])

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


let eumetsat = new EUMetSat(Config.EUMetSat.images_dir, logger)

if (cli.command === "fetch") {
    cli.info("Running EUMetSat.fetch().")
    eumetsat.fetch("http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_WV062_WestIndianOcean.jpg")
        .then((meta :Object) => {
            logger.info("fetch: Got sthg !")
        })
        .finally(() => {
            logger.info("fetch: Done, finally ;-")
        })
}
else if (cli.command === "fetch-all") {
    cli.info("Running EUMetSat.fetchAll().")
    eumetsat.fetchAll()
        .then((t) => {
            logger.info(`fetch-all: we're done.`)
        })
        .finally(() => {
            logger.info("fetch-all: finally, 'tis over.")
        })
}
else if (cli.command === "encode-all") {
  cli.info("Videos encode !")
  eumetsat.encodeImagesAsVideo()
  cli.info("End videos encode.")
} // encode-all //

cli.info('EOS')
