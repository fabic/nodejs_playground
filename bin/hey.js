#!/usr/bin/env node

'use strict';

console.log("Hey!");

let fs = require('fs');
const { sep: dirsep } = require('path');

/**
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
function find(dir, regx) {
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
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//const rootdir = "/mnt/nfs/wolf/papa/-- 10 -- MES RUSHS -- 990 GO";
const rootdir = "/mnt/nfs/wolf/papa";
let files = find(rootdir, /\.(avi|divx|dv|flv|ogm|mkv|mov|mp4|mpeg|mpg|xvid|webm)$/);

console.log("Got " + files.length + " files. Sorting by size now.");

files.sort((item1, item2) => {
  let sz = item1.stats.size - item2.stats.size;
  return sz != 0 ? sz : (
      item1.path.localeCompare(item2.path)
    );
});

files.forEach(({path, stats}) => {
  console.log(stats.nlink +' '+ stats.size + ' ' + path);
});

console.log("# <hardlinks count>  <file size>  <file path name>");
console.log("Got " + files.length + " files. Sorted by size.");
