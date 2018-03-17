#!/usr/bin/env node

/* @flow */

'use strict'

const assert = require('assert')
const cli    = require('cli')
const logger = require('winston')

import { URL }            from 'url'
import { sep as PATHSEP } from 'path'

import { EUMetSat } from '../bundles/eumetsat'

cli.info("HEY!")

cli.enable('status')
cli.parse({
    file: [ 'f', 'A file to process', 'file', null ],
    time: [ 't', 'An access time', 'time', false],
    work: [ false, 'What kind of work to do', 'string', 'sleep' ],
    regx: [ 'r', 'Regular expression', 'string', 'TODO' ],
}, ['fetch', 'fetch-all', 'encode'])

//console.log(cli.args)
//console.log(cli.command)
//console.log(cli.options)

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let eumetsat = new EUMetSat()

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

cli.info('EOS')
