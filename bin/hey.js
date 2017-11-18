#!/usr/bin/env node

'use strict';

console.log("Hey!");

let cli = require('cli');
let Finder = require('./finder.js');

cli.info("HEY!");
cli.enable('status');
cli.parse({
  file: [ 'f', 'A file to process', 'file', null ],
  time: [ 't', 'An access time', 'time', false],
  work: [ false, 'What kind of work to do', 'string', 'sleep' ],
  regx: [ 'r', 'Regular expression', 'string', 'TODO' ],
}, ['find', 'hash', 'encode']);

console.log(cli.args);
console.log(cli.command);
console.log(cli.options);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// const rootdir = "/mnt/nfs/wolf/papa/-- 10 -- MES RUSHS -- 990 GO";
// const rootdir = "/mnt/nfs/wolf/papa";
const rootdir = "/home/fabi/Downloads";

let files = Finder.find(rootdir, /\.(avi|divx|dv|flv|ogm|mkv|mov|mp4|mpeg|mpg|xvid|webm)$/);

console.log("Got " + files.length + " files. Sorting by size now.");

// Sort files by size (and file path).
files.sort((item1, item2) => {
  let sz = item1.stats.size - item2.stats.size;
  return sz != 0 ? sz : (
      item1.path.localeCompare(item2.path)
    );
});

/// FIND ONLY
if (cli.command == 'find') {
  files.forEach(({path, stats}) => {
    console.log(stats.nlink +' '+ stats.size + ' ' + path);
  });
  console.log("# <hardlinks count>  <file size>  <file path name>");
  console.log("Got " + files.length + " files. Sorted by size.");
}
// HASH
else if (cli.command == 'hash') {
  let currentSet = [];
  let currentSize = null;
  for (let i=0; i<files.length; i++) {
    const file = files[i];

    if (file.stats.size == currentSize) {
      currentSet.push( file );
      continue;
    }

    // ( Else: )

    if (currentSet.length == 0) {
      cli.error('Huh!');
      currentSet.push( file );
      currentSize = file.stats.size;
    }
    else if (currentSet.length == 1) {
      process.stderr.write('.');
    }
    else {
      cli.info("Got one same-size set with " + currentSet.length + " files.");
      currentSet.forEach(({path, stats}) => {
        cli.info("  > " + stats.nlink +' '+ stats.size + ' ' + path);
      });
    }

    // Rewind so that we start over with an empty files set.
    //i--;
    currentSize = file.stats.size;
    currentSet = [ file ];
  }
} // if hash //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

if (cli.command == 'encode') {
  const proc = require('child_process');

  files.forEach(({path, stats}) => {
    console.log(stats.nlink +' '+ stats.size + ' ' + path);
    let args = [];
    let options = {
      stdio: [process.stdin, process.stdout, process.stderr],
    };
    proc.spawnSync('ffmpeg', args, options);
  });
}
