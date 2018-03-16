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

cli.info("HEY!")

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
EUMetSat.prototype.probeResourceAt = function _eumetsat_probe_res(url :string)
{
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

        logger.debug(`Probing resource at ${url}`)
        logger.debug(options)

        const req = http.request(options, (res) => {
            logger.debug(`STATUS: ${res.statusCode}`);
            logger.debug(`HEADERS: ${JSON.stringify(res.headers)}`);

            res.on('data', (chunk) => {
                logger.warn("Huh! we shall NOT receive any data as part of a HEAD HTTP request !")
            });

            res.on('end', () => {
                logger.info(`Done fetching headers for the resource at ${url}`);
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

        const req = http.request(options, (res) => {
            logger.info(`Fetching resource at ${url}, saving to file '${saveFileName}'.`)
            logger.debug(`STATUS: ${res.statusCode}`);
            logger.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
            logger.info(`Creating file '${saveFileName}'.`)

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
            logger.error(`Problem with request: ${e.message}`);
            reject(e)
        });

        // write data to request body
        //req.write(postData);

        req.end();
    })
} // _eumetsat_fetch_res() //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EUMetSat.prototype.fetch = function _eumetsat_fetch(url :string) {
    logger.info(`EUMetSat.fetch('${url}') : BEGIN`)
    return this.probeResourceAt(url)
        // #1 : Infer a target on-disk file name based on the resource headers.
        //      Returns a "metadata" map (object).
        .then((headers: Object) => {
            const lastModified = new Date( headers['last-modified'] )
            const lastDotAt = headers._fileName.lastIndexOf('.')
            const saveFileNameExt = headers._fileName.substr(lastDotAt)
            const saveFileName = headers._fileName.substr(0, lastDotAt)
                + '_' + lastModified.toISOString()
                // Etag comes enclosed within double-quotes, remove these.
                + '_' + headers['etag'].substr(1, headers['etag'].length-2)
                + saveFileNameExt
            let meta = {
                saveFileName: saveFileName,
                saveFileNameExt: saveFileNameExt,
                url:      headers._url,
                fileName: headers._fileName,
                headers:  headers,
                mustFetchNewerResource: false,
                stats: null,
                file: null
            }
            return meta
        })
        // #2 : Find out if a file already exist on-disk
        //      We're setting the `meta.mustFetchNewerResource` flag for the
        //      next .then() handler.
        .then((meta :Object) => {
            meta.mustFetchNewerResource = false
            return new Promise((resolve, reject) => {
                fs.stat(meta.saveFileName, (err /* Error */, stats :fs.Stats) => {
                    const fileDoesNotExist = err && err.code === 'ENOENT';
                    if (fileDoesNotExist) {
                        meta.mustFetchNewerResource = true
                        resolve(meta)
                    }
                    // We do not expect any other form of error from stat()
                    else if (err)
                        reject( err )
                    // Else file exists and we need to test if it has the same
                    // size and Etag of the remote resource.
                    else {
                        // TODO: impl.
                        meta.stats = stats
                        resolve(meta)
                    }
                })
            })
        })
        // #3 : Fetch resource if needed.
        .then((meta :Object) => {
            if (meta.mustFetchNewerResource) {
                return this.fetchResourceAt(url, meta.saveFileName)
                    .then((file: fs.WriteStream) => {
                        meta.file = file
                        return meta
                    })
            }
            else return meta
        })
        // #4 : Drop a few lines through the log for information.
        .then((meta :Object) => {
            logger.debug(meta)
            return meta
        })
        .finally(() => {
            logger.info(`EUMetSat.fetch('${url}') : END.`)
        })
} // _eumetsat_fetch //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let eumetsat = new EUMetSat()

if (cli.command === "fetch") {
    cli.info("Running EUMetSat.fetch().")
    eumetsat.fetch("http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_WV062_WestIndianOcean.jpg")
        .then((meta :Object) => {
            logger.info("Got sthg !")
        })
        .finally(() => {
            logger.info("Done ;-")
        })
}

cli.info('EOS')
