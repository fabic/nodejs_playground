#!/usr/bin/env node

'use strict';

let assert = require('assert');
let cli = require('cli');
let Finder = require('./finder.js');

cli.info("Hey!");
cli.enable('status');
cli.parse({
  file: [ 'f', 'A file to process', 'file', null ],
  time: [ 't', 'An access time', 'time', false],
  work: [ false, 'What kind of work to do', 'string', 'sleep' ],
  regx: [ 'r', 'Regular expression', 'string', 'TODO' ],
}, ['find', 'hash', 'encode']);

//console.log(cli.args);
//console.log(cli.command);
//console.log(cli.options);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// const rootdir = "/mnt/nfs/wolf/papa/-- 10 -- MES RUSHS -- 990 GO";
// const rootdir = "/mnt/nfs/wolf/papa";
const rootdir = cli.args[0] || "/home/fabi/Downloads";

let files = Finder.find(rootdir, /\.(avi|divx|dv|flv|ogm|mkv|mov|mp4|mpeg|mpg|xvid|webm)$/);

cli.info("Got " + files.length + " files. Sorting by size now.");

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
  // todo: if files not empty...
  assert(files.length > 0, "TODO: dude -_- wtf ?");

  let currentSet = [ files[0] ];
  let currentSize = files[0].stats.size;

  for (let i=1; i<files.length; i++) {
    const file = files[i];

    // Collect consecutive files with same size.
    if (file.stats.size == currentSize) {
      currentSet.push( file );
      continue;
    }

    //
    // Else => we've got one file(s) set => process it.
    //

    // MAINT.: Code guard for futur maintenance on this non-trivial loop.
    //         (i.e. current file(s) set may not be empty).
    if (currentSet.length == 0) {
      assert.fail(currentSet.length, 0, "Can't be!", '>'); // would throw ex.!
      break;
    }
    // Silently skip lone files (unique size).
    else if (currentSet.length == 1) {
      process.stderr.write('.');
    }
    // Actual files set processing.
    else {
      cli.info("Got one same-size set with " + currentSet.length + " files.");
      currentSet.forEach(({path, stats}) => {
        cli.info("  > " + stats.nlink +' '+ stats.size + ' ' + path);
      });
    }

    // ^ done processing current files set.

    // Start over with a fresh file set.
    currentSize = file.stats.size;
    currentSet = [ file ];
  }
} // if hash //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

if (cli.command == 'encode') {
  const proc = require('child_process');

  files.forEach(({path, stats}) => {
    cli.info(stats.nlink +' '+ stats.size + ' ' + path);
    let args = [];
    let options = {
      stdio: [process.stdin, process.stdout, process.stderr],
    };
    proc.spawnSync('ffmpeg', args, options);
  });
}

cli.info('Bye ;-');
