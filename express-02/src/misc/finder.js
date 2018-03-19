/**
 * FILE FINDER MODULE
 *
 * @author fabic
 * @since  2017-11
 *
 * @flow
 */

'use strict'

let cli = require('cli')
let fs = require('fs')
const { sep: dirsep } = require('path')

// module.exports = Finder
// ^ Resorting to the fancy new 'export' ES6 keyword.

/**
 *
 * @constructor
 */
export function Finder () {
}


type FileCollection = Array<{path: string, stats: fs.Stats, id: string, hash: string}>
type File = {path: string, stats: fs.Stats, id: string, hash: ?string}

/**
 * (Class-method).
 *
 * Find files in 'dir' that match 'regx'.
 *
 * Impl. is BFS and we use synchronous 'fs' functions (!).
 *
 * todo: many things; visited node handling (cycles);
 *
 * @param  dir   {string}
 * @param  regx  {RegExp}
 * @return {Array}  a collection of {path: ..., stats: fs.Stats}.
 */
Finder.find = function _finder_find(dir :string, regx :RegExp) : File[]
{
  regx = regx || /./

  let visited = {}; // todo.
  let queue = []
  let collect :File[] = []

  cli.info("BEGIN: find('" + dir + "', " + regx.toString() + ").")

  queue.unshift({path: dir})

  while( queue.length > 0 ) {

    let {path} = queue.shift()

    // cli.info("'" + path + dirsep + "'")
    process.stderr.write("\r'" + path + dirsep + "'")

    let files = null

    try {
      files = fs.readdirSync( path )
    }
    catch(ex) {
      cli.error("Could not read directory contents of '" + path + "': "
        + ex)
      continue
    }

    files.forEach(file => {
      try {
        const filePathName = path + dirsep + file

        let stats = fs.lstatSync(filePathName)

        let item :File = {
          path:  filePathName,
          stats: stats,
          id:    stats.dev +'-'+ stats.ino,
          hash:  null
        }

        /* BFS: Enqueue directories for processing later on. */
        if (stats.isDirectory()) {
          queue.unshift(item)
          //cli.info("  > '" + item.path + dirsep + "'")
          return
        }
        /* We're _not_ following symlinks at the moment.
         * TODO: Find out what to do with all those broken sym. links. */
        else if (stats.isSymbolicLink()) {
          try {
            const target = fs.readlinkSync(item.path)
            cli.info("Symlink '" + item.path + "': '" + target + "'")
          } catch(ex) {
            cli.error("ERROR: Couldn't read symlink '" + item.path + "',")
            cli.error("     ` RE-THROWING EXCEPTION: " + ex)
            throw ex
          }
          return
        }
        /* Skip sockets, devices, or whatever else */
        else if (!stats.isFile()) {
          cli.info("SKIPPING NON-FILE: '" + item.path + "'")
          return
        }
        /* Skip files that do not match the regular expression. */
        else if (!regx.test(file)) {
            return
        }

        collect.push(item)

        //console.log(item.path +' ('+ item.stats.size +')' )
      } catch(ex) {
        cli.error("ERROR: Couldn't stat() something. Exception caugth: " + ex)
        return
      }
    })

  } // iteration over the queue. //

  process.stdout.write("\n")
  cli.ok("END: find('" + dir + "', " + regx.toString() + ").")
  cli.ok("     Got " + collect.length + " files.")

  return collect
} // _finder_find() //
