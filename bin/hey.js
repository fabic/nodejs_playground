#!/usr/bin/env node

'use strict';

let cli = require('cli');
let Finder = require('./finder.js');

cli.info("Hey!");
cli.enable('status');
cli.parse({
  file: [ 'f', 'A file to process', 'file', null ],
  time: [ 't', 'An access time', 'time', false],
  work: [ false, 'What kind of work to do', 'string', 'sleep' ],
  regx: [ 'r', 'Regular expression', 'string', 'TODO' ],
}, ['find', 'encode']);

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

files.forEach(({path, stats}) => {
  cli.info(stats.nlink +' '+ stats.size + ' ' + path);
});

cli.info("# <hardlinks count>  <file size>  <file path name>");
cli.info("Got " + files.length + " files. Sorted by size.");

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
