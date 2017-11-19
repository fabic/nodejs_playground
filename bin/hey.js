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


function Dedup() {
  if ( ! (this instanceof Dedup) ) {
    return new Dedup();
  }
}

Dedup.find = function _dedup_find(dir, regx) {
  let files = Finder.find(rootdir, regx);

  //cli.info("Got " + files.length + " files. Sorting by size now.");

  // Sort files by size (and file path).
  files.sort((item1, item2) => {
    let sz = item1.stats.size - item2.stats.size;
    return sz != 0 ? sz : (
      item1.path.localeCompare(item2.path)
      );
  });

/// FIND ONLY
// if (cli.command == 'find') {
//   files.forEach(({path, stats}) => {
//     console.log(stats.nlink +' '+ stats.size + ' ' + path);
//   });
//   console.log("# <hardlinks count>  <file size>  <file path name>");
//   console.log("Got " + files.length + " files. Sorted by size.");
// }
// HASH
// else if (cli.command == 'hash') {

  // Partition the set of files into subsets of files that have the same size.

  // todo: if files not empty...
  assert(files.length > 0, "TODO: dude -_- wtf ?");

  let currentSet = [ files[0] ];
  let currentSize = files[0].stats.size;
  let subsets = []; // output val.

  for (let i=1; i<files.length; i++) {
    const file = files[i];

    // Collect consecutive files with same size.
    if (file.stats.size == currentSize) {
      currentSet.push( file );
      continue;
    }

    //
    // (else {...}) => we've got one file(s) set => process it.
    //

    // MAINT.: Code guard for futur maintenance on this non-trivial loop.
    //         (i.e. current file(s) set may not be empty).
    if (currentSet.length == 0) {
      assert.fail(currentSet.length, 0, "Can't be!", '>'); // would throw ex.!
      break;
    }
    // Silently skip lone files (unique size).
    else if (currentSet.length == 1) {
      /* noop */ ;
    }
    // Actual files set processing.
    else {
      subsets.push( currentSet );
    }

    // ^ done processing current files set.

    // Start over with a fresh file set.
    currentSize = file.stats.size;
    currentSet = [ file ];
  } // files set iter. //

  return {
    files,
    subsets
  };
} // _dedup_find() //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const rootdir = cli.args[0] || "/home/fabi/Downloads";

let { files, subsets } = Dedup.find(rootdir, /\.(avi|divx|dv|flv|ogm|mkv|mov|mp4|mpeg|mpg|xvid|webm)$/);

subsets.forEach(set => {
      cli.info("Got one same-size set with " + set.length + " files.");
      set.forEach(({path, stats}) => {
        cli.info("  > " + stats.nlink +' '+ stats.size + ' ' + path);
      });
});

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
