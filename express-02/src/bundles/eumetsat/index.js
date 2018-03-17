/* @flow */

'use strict'

const assert = require('assert')
const logger = require('winston')
const fs     = require('fs')
const http   = require('http')
const schedule = require('node-schedule')

import { URL }            from 'url'
import { sep as PATHSEP } from 'path'

// module.exports = EUMetSat

/**
 *
 * @constructor
 * @param imagesDirectory {string}
 * @returns {EUMetSat}
 */
export function EUMetSat(imagesDirectory :string = ".") {
    if ( ! (this instanceof EUMetSat) ) {
        return new EUMetSat()
    }

    this.imagesDirectory = imagesDirectory

    this.satelliteImagesList = [
        { id: "WV_6.2_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_WV062_WestIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels" },
        { id: "WV_6.2_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_WV062_EastIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels" },
        // { id: "IR_3.9_Color_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_IR039Color_WestIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels },
        // { id: "IR_3.9_Color_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_IR039Color_EastIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels },
        { id: "IR_10.8_Color_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_IR108Color_WestIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels" },
        { id: "IR_10.8_Color_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_IR108Color_EastIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels" },
        // { id: "VIS006Color_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_VIS006Color_WestIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels },
        // { id: "VIS006Color_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_VIS006Color_EastIndianOcean.jpg", update_frequency: 3*60*60, type: "Channels },

        { id: "RGB_Airmass_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBAirmass_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_Airmass_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBAirmass_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_Ash_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBAsh_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_Ash_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBAsh_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        // { id: "RGB_Convection_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBConvection_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites },
        // { id: "RGB_Convection_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBConvection_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites },
        // { id: "RGB_Dust_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBDust_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites },
        // { id: "RGB_Dust_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBDust_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites },
        // { id: "RGB_Fog_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBFog_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites },
        // { id: "RGB_Fog_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBFog_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites },
        { id: "RGB_Microphysics_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBMicrophysics_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_Microphysics_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBMicrophysics_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_NatColour_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBNatColour_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_NatColour_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBNatColour_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_SolarDay_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBSolarDay_WestIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },
        { id: "RGB_SolarDay_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBSolarDay_EastIndianOcean.jpg", update_frequency: 60*60, type: "RGB Composites" },

        { id: "MPE_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_MPE_WestIndianOcean.png", update_frequency: 15*60, type: "Visualised Products" },
        { id: "MPE_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_MPE_EastIndianOcean.png", update_frequency: 15*60, type: "Visualised Products" },

        // Nothing to see on these.
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_FIR_WestIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_FIR_EastIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },
        // “Wind gradient arrows drawn on grey map” :
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_AMV_WestIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_AMV_EastIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },
    ]
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
        logger.info(`EUMetSat.probeResourceAt('${url}').`)

        const _url = new URL(url)

        const options = {
            hostname: _url.hostname,
            port: _url.port,
            path: _url.pathname + _url.search,
            method: 'HEAD',
            headers: {
                'Connection': 'keep-alive'
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
                logger.info(`EUMetSat.probeResourceAt(): Done fetching headers for the resource at ${url}`);
                let headers = Object.assign({
                    _url: _url,
                    _fileName: _url.pathname.substr(_url.pathname.lastIndexOf('/')+1) ||
                    "_eumetsat_probe_res__error_inferring_file_name"
                }, res.headers)
                resolve( headers )
            });
        });

        req.on('error', (e) => {
            logger.error(`EUMetSat.probeResourceAt(): Problem with request: ${e.message}`);
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
        logger.info(`EUMetSat.fetchResourceAt('${url}', '${saveFileName}').`)

        const _url = new URL(url)

        const options = {
            hostname: _url.hostname,
            port: _url.port,
            path: _url.pathname + _url.search,
            method: 'GET',
            headers: {
                'Connection': 'keep-alive'
            }
        };

        // Infer file name from the resource url.
        saveFileName = saveFileName || (this.imagesDirectory + PATHSEP
            + (options.path.substr(options.path.lastIndexOf('/') + 1) ||
                "_eumetsat_fetch_error_couldnt_infer_image_filename"))

        const req = http.request(options, (res) => {
            logger.info(`EUMetSat.fetchResourceAt(): Fetching resource at ${url}, saving to file '${saveFileName}'.`)
            logger.debug(`STATUS: ${res.statusCode}`);
            logger.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
            logger.info(`EUMetSat.fetchResourceAt(): Creating file '${saveFileName}'.`)

            const file = fs.createWriteStream(saveFileName, { encoding: 'binary' })

            res.setEncoding('binary');

            res.on('data', (chunk) => {
                file.write(chunk, 'binary')
                logger.debug(`EUMetSat.fetchResourceAt(): Writing chunk to file ${saveFileName}...`)
            });

            res.on('end', () => {
                logger.debug('No more data in response.');
                resolve(file)
            });
        });

        req.on('error', (e) => {
            logger.error(`EUMetSat.fetchResourceAt(): Problem with request: ${e.message}`);
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

EUMetSat.prototype.fetchAll = function _eumetsat_fetch_all() {
    return new Promise(async (resolve, reject) => {
        logger.info(`EUMetSat.fetchAll() : BEGIN`)
        // this.satelliteImagesList.forEach(async (elt :Object) => {
        //     logger.info(`EUMetSat.fetchAll(): Processing resource at ${elt.url}`)
        //     let foo = await this.fetch(elt.url)
        //     // console.log(foo)
        // })
        for(const elt of this.satelliteImagesList) {
            logger.info(`EUMetSat.fetchAll(): Processing resource at ${elt.url}`)
            let foo = await this.fetch(elt.url)
        }

        resolve(true)
    })
} // _eumetsat_fetch //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

