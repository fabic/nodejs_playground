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

  queue.unshift({path: dir});

  while( queue.length > 0 ) {

    let {path} = queue.shift();

    let files = fs.readdirSync(path);

    files.forEach(file => {
      let stats = fs.statSync(path + dirsep + file);

      let item = {path: path+dirsep+file, stats: stats};

      if (stats.isDirectory()) {
        queue.unshift(item);
        return;
      }
      else if (!stats.isFile()) {
        return;
      }
      else if (!regx.test(file)) {
          return;
      }

      collect.push(item);

      // console.log(file +' '+ stats.size);
    });

  }

  return collect;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let files = find('/home/fabi/Downloads', /\.(mkv|mp4|avi|mpg|mpeg|mov|dv|divx|webm)$/);

files.sort((item1, item2) => {
  let sz = item1.stats.size - item2.stats.size;
  return sz != 0 ? sz : (
      item1.path.localeCompare(item2.path)
    );
});

files.forEach(({path, stats}) => {
  console.log(stats.size + ' ' + path);
});
