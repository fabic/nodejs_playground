#!/usr/bin/env node

'use strict'

import DB from '../bundles/db'

import    cli from "cli"
import Config from '../../config'

cli.info("HEY!")
cli.enable('status')
cli.parse({
  file: [ 'f', 'A file to process', 'file', null ],
  time: [ 't', 'An access time', 'time', false],
  work: [ false, 'What kind of work to do', 'string', 'sleep' ],
}, ['connect'])

if (cli.command === 'connect') {

const db = new DB(Config.database)

db.connect()
  .then((mclient) => {
    cli.info("Dude?")
    //console.log(mclient)
    const db = mclient.db('fabi')
    mclient.close()
  })

}

// EOF //