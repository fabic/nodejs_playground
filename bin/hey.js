#!/usr/bin/env node

'use strict';

console.log("Hey!");

let Finder = require('./finder.js');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//const rootdir = "/mnt/nfs/wolf/papa/-- 10 -- MES RUSHS -- 990 GO";
// const rootdir = "/mnt/nfs/wolf/papa";
const rootdir = "/home/fabi/Downloads";
let files = Finder.find(rootdir, /\.(avi|divx|dv|flv|ogm|mkv|mov|mp4|mpeg|mpg|xvid|webm)$/);

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
