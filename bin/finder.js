/**
 * FILE FINDER MODULE
 *
 * @author fabic
 * @since  2017-11
 */

'use strict';

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

  console.log("BEGIN: find('" + dir + "', " + regx + ").");

  queue.unshift({path: dir});

  while( queue.length > 0 ) {

    let {path} = queue.shift();

    console.log(path + dirsep);

    let files = fs.readdirSync(path);

    files.forEach(file => {
      try {
        const filePathName = path + dirsep + file;

        let stats = fs.lstatSync(filePathName);

        let item = {path: filePathName, stats: stats};

        /* BFS: Enqueue directories for processing later on. */
        if (stats.isDirectory()) {
          queue.unshift(item);
          console.log("  > " + item.path + dirsep);
          return;
        }
        /* We're _not_ following symlinks at the moment.
         * TODO: Find out what to do with all those broken sym. links. */
        else if (stats.isSymbolicLink()) {
          try {
            const target = fs.readlinkSync(item.path);
            console.log("Symlink '" + item.path + "': " + target);
          } catch(ex) {
            console.log("ERROR: Couldn't read symlink '" + item.path + "',");
            console.log("     ` RE-THROWING EXCEPTION: " + ex);
            throw ex;
          }
          return;
        }
        /* Skip sockets, devices, or whatever else */
        else if (!stats.isFile()) {
          return;
        }
        else if (!regx.test(file)) {
            return;
        }

        collect.push(item);

        //console.log(item.path +' ('+ item.stats.size +')' );
      } catch(ex) {
        console.log("ERROR: Couldn't stat()" + ex);
        return;
      }
    });

  }

  console.log("END: find('" + dir + "', " + regx + ").");
  console.log("   ` Got " + collect.length + " files.");

  return collect;
} // find().
