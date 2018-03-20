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
  cli.info("Hola!")
  const {types: imagesByType} = eumetsat.getAllOnDiskImages()
  for (const pair: [string, []] of Object.entries(imagesByType)) {
    const [type, images] = pair
    cli.info(`Type ${type}`)

    // Create a temporary file for FFmpeg `-f concat -i file-list.txt` :
    const tmpFileName = NodeTmp.file(
      { prefix: `FFmpeg-EUMetSat-input-images-list-`,
        postfix: '.txt',
        dir: process.cwd(),
        keep: true
      },
      function(err, path, fd) {
        if (err) throw err
        cli.info(`Writing FFmpeg images list file: ${path}`)
        images.forEach((item) => {
          // cli.info(` \` ${item.fileName}`)
          let line1 = `file '${item.path}'\n`
          FS.writeSync(fd, line1)
        })
        FS.closeSync(fd)
        //
        if (true) {
          let outputVideoFileName = `${type}.mp4`
          const inputImagesListFileName = path
          /*
           * ( ls public/EUMetSat/EUMETSAT_MSGIODC_RGBSolarDay_WestIndianOcean_*.jpg ) \
           * | sed -e "s/^\(.*\)$/file '\1'/" \
           * | ffmpeg -loglevel info -stats -r 2 -f concat -safe 0 -protocol_whitelist file,pipe -i - \
           *          -s 1322x1306 -codec:v libx264 -r 25 -preset medium -threads 0 \
           *          -vf format=yuv420p -crf 26 -bf 2 -g 60 -movflags faststart \
           *          -y "out.mp4"
           * Or:
           * ffmpeg -pattern_type glob -i 'EUMETSAT_MSGIODC_*_WestIndianOcean_*.jpg' \
           *        -s 1322x1310 -c:v libx264 -r 30 -pix_fmt yuv420p out.mp4
           */
          let args = [
            '-loglevel', 'info', '-stats',
            '-r', '2', '-f', 'concat', '-safe', '0',
            '-protocol_whitelist', 'file,pipe',
            '-i', inputImagesListFileName,
            '-s', '1322x1306', '-codec:v', 'libx264', '-r', '25',
            '-preset', 'medium',
            '-threads', '0',
            '-vf', 'format=yuv420p', '-crf', '26', '-bf', '2', '-g', '60',
            '-movflags', 'faststart',
            '-y', outputVideoFileName
          ]

          let options = {
            stdio: [process.stdin, process.stdout, process.stderr],
          }

          proc.spawnSync('ffmpeg', args, options)
        }
      })
  }
} // encode-all //

cli.info('EOS')
