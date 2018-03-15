#!/usr/bin/env node

/* @flow */

'use strict'

let assert = require('assert')
let cli = require('cli')

cli.info("Hey!")
cli.enable('status')
cli.parse({
    file: [ 'f', 'A file to process', 'file', null ],
    time: [ 't', 'An access time', 'time', false],
    work: [ false, 'What kind of work to do', 'string', 'sleep' ],
    regx: [ 'r', 'Regular expression', 'string', 'TODO' ],
}, ['fetch', 'hash', 'encode'])

//console.log(cli.args)
//console.log(cli.command)
//console.log(cli.options)

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


function EUMetSat() {
    if ( ! (this instanceof EUMetSat) ) {
        return new EUMetSat()
    }

    this.http = require('http')
}

EUMetSat.prototype.fetch = function _eumetsat_fetch(url :string) {

    const { URL } = require('url')
    const _url = new URL(url)

    const options = {
        hostname: _url.hostname,
        port: _url.port,
        path: _url.pathname + _url.search,
        method: 'HEAD',
        headers: {
        }
    };

    console.log(options)

    const req = this.http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // write data to request body
    //req.write(postData);
    req.end();

    return { }
} // _eumetsat_fetch() //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let eumetsat = new EUMetSat()

if (cli.command == "fetch") {
    cli.info("Running EUMetSat.fetch().")
    eumetsat.fetch("http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_WV062_WestIndianOcean.jpg")
}

cli.info('Bye ;-')
