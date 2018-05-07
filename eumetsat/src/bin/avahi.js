#!/usr/bin/env node

'use strict'

import Avahi from '../bundles/avahi'

import cli from "cli"
import Config from '../../config'

cli.info("HEY!")
cli.enable('status')
cli.parse({
  file: ['f', 'A file to process', 'file', null],
  time: ['t', 'An access time', 'time', false],
  work: [false, 'What kind of work to do', 'string', 'sleep'],
}, ['publish'])

if (cli.command === 'publish') {

  const avahi = new Avahi()
  avahi.publish('dude.local')

}

// EOF //