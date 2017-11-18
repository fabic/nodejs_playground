/**
 * FILE FINDER MODULE
 *
 * @author fabic
 * @since  2017-11
 */

'use strict';

let cli = require('cli');
let fs = require('fs');
const { sep: dirsep } = require('path');

/**
 * Finder class.
 */
function Finder () {
  if ( ! (this instanceof Finder) ) {
    return new Finder();
  }
}

module.exports = Finder;

/**
 * (Class-method).
 *
 * Find files in 'dir' that match 'regx'.
 *
 * Impl. is BFS and we use synchronous 'fs' functions (!).
 *
 * todo: many things; visited node handling (cycles);
 *
 * @param  {string} dir
 * @param  {RegEx}  regx
 * @return {Array}  a collection of {path: ..., stats: fs.Stats}.
 */
Finder.find = function find(dir, regx) {
  regx = regx || /./;

  let visited = {}; // todo.
  let queue = [];
  let collect = [];

  cli.info("BEGIN: find('" + dir + "', " + regx + ").");

  queue.unshift({path: dir});

  while( queue.length > 0 ) {

    let {path} = queue.shift();

    // cli.info("'" + path + dirsep + "'");
    process.stderr.write("\r'" + path + dirsep + "'");

    let files = null;

    try {
      files = fs.readdirSync( path );
    }
    catch(ex) {
      cli.error("Could not read directory contents of '" + path + "': "
        + ex);
      continue;
    }

    files.forEach(file => {
      try {
        const filePathName = path + dirsep + file;

        let stats = fs.lstatSync(filePathName);

        let item = {path: filePathName, stats: stats};

        /* BFS: Enqueue directories for processing later on. */
        if (stats.isDirectory()) {
          queue.unshift(item);
          //cli.info("  > '" + item.path + dirsep + "'");
          return;
        }
        /* We're _not_ following symlinks at the moment.
         * TODO: Find out what to do with all those broken sym. links. */
        else if (stats.isSymbolicLink()) {
          try {
            const target = fs.readlinkSync(item.path);
            cli.info("Symlink '" + item.path + "': '" + target + "'");
          } catch(ex) {
            cli.error("ERROR: Couldn't read symlink '" + item.path + "',");
            cli.error("     ` RE-THROWING EXCEPTION: " + ex);
            throw ex;
          }
          return;
        }
        /* Skip sockets, devices, or whatever else */
        else if (!stats.isFile()) {
          cli.info("SKIPPING NON-FILE: '" + item.path + "'");
          return;
        }
        /* Skip files that do not match the regular expression. */
        else if (!regx.test(file)) {
            return;
        }

        collect.push(item);

        //console.log(item.path +' ('+ item.stats.size +')' );
      } catch(ex) {
        cli.error("ERROR: Couldn't stat() something. Exception caugth: " + ex);
        return;
      }
    });

  }

  process.stdout.write("\n");
  cli.ok("END: find('" + dir + "', " + regx + ").");
  cli.ok("     Got " + collect.length + " files.");

  return collect;
} // find().
