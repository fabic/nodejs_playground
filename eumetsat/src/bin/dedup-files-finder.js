#!/usr/bin/env node

/** File `src/bin/dedup-files-finder.js`
 *
 * Usage:
 *
 *     $ bin/babel-node src/bin/dedup-files-finder.js find ...
 *
 * @flow
 */

'use strict'

let assert = require('assert')
let cli = require('cli')

import { Dedup }  from '../misc/files-dedup'

cli.info("Hey!")
cli.enable('status')
cli.parse({
  file: [ 'f', 'A file to process', 'file', null ],
  time: [ 't', 'An access time', 'time', false],
  work: [ false, 'What kind of work to do', 'string', 'sleep' ],
  regx: [ 'r', 'Regular expression', 'string', 'TODO' ],
}, ['find', 'hash', 'encode'])

//console.log(cli.args)
//console.log(cli.command)
//console.log(cli.options)

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const rootdir = cli.args[0] || "/home/fabi/Downloads"

let { files, subsets } = Dedup.find(rootdir, /\.(avi|divx|dv|flv|ogm|mkv|mov|mp4|mpeg|mpg|xvid|webm)$/)

const crypto = require('crypto')
const fs     = require('fs')

subsets.forEach(set => {
      cli.info("Got one same-size set with " + set.length + " files.")

      const bufferSize = 4096
      const buffer = Buffer.alloc( bufferSize )

      let map = {}

      set.forEach(file => {
        if (file.id in map) {
          map[ file.id ].push( file )
          return
        }

        let hash_1 = "VOID!"

        try {
          const fd = fs.openSync(file.path, 'r')
          const nbytes = fs.readSync(fd, buffer, /* buf. offset */ 0, buffer.length, /* offset in file */ 0)
          const hash = crypto.createHash('sha256')
          // Handle the case where we read less bytes than we requested, note that
          // Buffer.slice(start,end) returns a Buffer that _references_ the same
          // memory region (hence avoiding perf. impact due to new allocation).
          hash.update( nbytes < buffer.length ? buffer.slice(0, nbytes) : buffer )
          hash_1 = hash.digest('hex')
          fs.closeSync( fd )
        }
        catch(ex) {
          cli.error("Failed to open/read from file, ex.: " + ex)
        }

        file.hash = hash_1

        map[ file.id ] = [ file ]

        cli.info("  > " + hash_1 +' '+ file.stats.nlink +' '+ file.stats.size + ' ' + file.path)
      })
})

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

if (cli.command == 'encode') {
  const proc = require('child_process')

  files.forEach(({path, stats}) => {
    cli.info(stats.nlink +' '+ stats.size + ' ' + path)
    let args = []
    let options = {
      stdio: [process.stdin, process.stdout, process.stderr],
    }
    proc.spawnSync('ffmpeg', args, options)
  })
}

cli.info('Bye ;-')
