#!/usr/bin/env node

console.log("Hey!");

let fs = require('fs');

fs.readdir('/home/fabi/Downloads/', null, function(err, files) {
    if (err)
        throw err;
    console.log('readdir().');
    files.forEach(function(file) {
        console.log(file);
    })
});