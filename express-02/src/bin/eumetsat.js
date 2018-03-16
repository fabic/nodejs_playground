#!/usr/bin/env node

/* @flow */

'use strict'

const assert = require('assert')
const cli    = require('cli')
const logger = require('winston')
const fs     = require('fs')
const http   = require('http')

import { URL }            from 'url'
import { sep as PATHSEP } from 'path'

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

/**
 * @constructor
 * @param imagesDirectory {string}
 * @returns {EUMetSat}
 */
function EUMetSat(imagesDirectory = ".") {
    if ( ! (this instanceof EUMetSat) ) {
        return new EUMetSat()
    }

    this.imagesDirectory = imagesDirectory
}

/**
 * Issue a HEAD request for the given resource located at `url`.
 *
 * @param url {string}
 * @returns {Promise<any>}
 */
EUMetSat.prototype.probeResourceAt = function _eumetsat_probe_res(url :string) {
    return new Promise((resolve, reject) => {
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

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            res.on('data', (chunk) => {
                logger.warn("Huh! we shall NOT receive any data as part of a HEAD HTTP request !")
            });

            res.on('end', () => {
                logger.info('No more data in response.');
                let headers = Object.assign({
                    _url: _url,
                    _fileName: _url.pathname.substr(_url.pathname.lastIndexOf('/')+1) ||
                                 "_eumetsat_probe_res__error_inferring_file_name"
                }, res.headers)
                resolve( headers )
            });
        });

        req.on('error', (e) => {
            logger.error(`Problem with request: ${e.message}`);
            reject(e)
        });

        req.end();
    })
} // _eumetsat_probe_res() //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Download the resource at `url`
 *
 * @param url {string}
 * @param saveFileName {string}
 * @returns {Promise<any>}
 */
EUMetSat.prototype.fetchResourceAt = function _eumetsat_fetch_res(url :string,
                                                                  saveFileName :string)
{
    return new Promise((resolve, reject) => {
        const _url = new URL(url)

        const options = {
            hostname: _url.hostname,
            port: _url.port,
            path: _url.pathname + _url.search,
            method: 'GET',
            headers: {
            }
        };

        // Infer file name from the resource url.
        saveFileName = saveFileName || (this.imagesDirectory + PATHSEP
            + (options.path.substr(options.path.lastIndexOf('/') + 1) ||
                "_eumetsat_fetch_error_couldnt_infer_image_filename"))

        logger.debug(options, saveFileName)

        const req = http.request(options, (res) => {
            logger.info(`About to fetch resource at ${url}, saving to file ${saveFileName}.`)

            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            logger.debug(`Creating file '${saveFileName}'.`)

            const file = fs.createWriteStream(saveFileName, { encoding: 'binary' })

            res.setEncoding('binary');

            res.on('data', (chunk) => {
                file.write(chunk, 'binary')
                logger.debug(`Writing chunk to file ${file.path}...`)
            });

            res.on('end', () => {
                logger.debug('No more data in response.');
                resolve(file)
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            reject(e)
        });

        // write data to request body
        //req.write(postData);

        req.end();
    })
} // _eumetsat_fetch_res() //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EUMetSat.prototype.fetch = function _eumetsat_fetch(url :string) {
    return this.probeResourceAt(url)
        .then((headers: Object) => {
            console.log(headers)
            const lastModified = new Date( headers['last-modified'] )
            let saveFileName = `${headers._fileName}_${lastModified.toISOString()}`
            console.log(lastModified, saveFileName)
            return this.fetchResourceAt(url, saveFileName)
        })
        .then((file: fs.WriteStream) => {
            return file
        })
} // _eumetsat_fetch //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let eumetsat = new EUMetSat()

if (cli.command == "fetch") {
    cli.info("Running EUMetSat.fetch().")
    eumetsat.fetch("http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_WV062_WestIndianOcean.jpg")
        .then((file :fs.WriteStream) => {
            console.log(file, file.path)
        })

}

cli.info('Bye ;-')
