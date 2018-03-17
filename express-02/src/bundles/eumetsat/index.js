/* @flow */

'use strict'

const assert = require('assert')
const fs     = require('fs')
const http   = require('http')
const NodeSchedule = require('node-schedule')

import { URL }            from 'url'
import { sep as PATHSEP } from 'path'

// module.exports = EUMetSat

/**
 *
 * @constructor
 * @param imagesDirectory {string}
 * @param logger {Object}
 * @returns {EUMetSat}
 */
export function EUMetSat(imagesDirectory :string = ".",
                         logger :Object = null,
                         jobScheduler :Object = null)
{
    this.imagesDirectory = imagesDirectory
    this.logger = logger || console
    this.jobScheduler = jobScheduler || NodeSchedule

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
        this.logger.info(`EUMetSat.probeResourceAt('${url}').`)

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

        this.logger.debug(`Probing resource at ${url}`)
        this.logger.debug(options)

        const req = http.request(options, (res) => {
            this.logger.debug(`STATUS: ${res.statusCode}`);
            this.logger.debug(`HEADERS: ${JSON.stringify(res.headers)}`);

            res.on('data', (chunk) => {
                this.logger.warn("Huh! we shall NOT receive any data as part of a HEAD HTTP request !")
            });

            res.on('end', () => {
                this.logger.info(`EUMetSat.probeResourceAt(): Done fetching headers for the resource at ${url}`);
                let headers = Object.assign({
                    _url: _url,
                    _fileName: _url.pathname.substr(_url.pathname.lastIndexOf('/')+1) ||
                    "_eumetsat_probe_res__error_inferring_file_name"
                }, res.headers)
                resolve( headers )
            });
        });

        req.on('error', (e) => {
            this.logger.error(`EUMetSat.probeResourceAt(): Problem with request: ${e.message}`);
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
        this.logger.info(`EUMetSat.fetchResourceAt('${url}', '${saveFileName}').`)

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
            this.logger.info(`EUMetSat.fetchResourceAt(): Fetching resource at ${url}, saving to file '${saveFileName}'.`)
            this.logger.debug(`STATUS: ${res.statusCode}`);
            this.logger.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
            this.logger.info(`EUMetSat.fetchResourceAt(): Creating file '${saveFileName}'.`)

            const file = fs.createWriteStream(saveFileName, { encoding: 'binary' })

            res.setEncoding('binary');

            res.on('data', (chunk) => {
                file.write(chunk, 'binary')
                this.logger.debug(`EUMetSat.fetchResourceAt(): Writing chunk to file ${saveFileName}...`)
            });

            res.on('end', () => {
                this.logger.debug('No more data in response.');
                resolve(file)
            });
        });

        req.on('error', (e) => {
            this.logger.error(`EUMetSat.fetchResourceAt(): Problem with request: ${e.message}`);
            reject(e)
        });

        // write data to request body
        //req.write(postData);

        req.end();
    })
} // _eumetsat_fetch_res() //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EUMetSat.prototype.fetch = function _eumetsat_fetch(url :string) {
    this.logger.info(`EUMetSat.fetch('${url}') : BEGIN`)
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
                lastModified: lastModified,
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
            this.logger.debug(meta)
            return meta
        })
        .finally(() => {
            this.logger.info(`EUMetSat.fetch('${url}') : END.`)
        })
} // _eumetsat_fetch //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EUMetSat.prototype.fetchAll = function _eumetsat_fetch_all() {
    return new Promise(async (resolve, reject) => {
        this.logger.info(`EUMetSat.fetchAll() : BEGIN`)
        // this.satelliteImagesList.forEach(async (elt :Object) => {
        //     this.logger.info(`EUMetSat.fetchAll(): Processing resource at ${elt.url}`)
        //     let foo = await this.fetch(elt.url)
        //     // console.log(foo)
        // })
        for(const elt of this.satelliteImagesList) {
            this.logger.info(`EUMetSat.fetchAll(): Processing resource at ${elt.url}`)
            let foo = await this.fetch(elt.url)
        }

        resolve(true)
    })
} // _eumetsat_fetch //

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EUMetSat.prototype.launchFetchJobs = function _eumetsat_launch_fetch_jobs()
{
    return new Promise((resolve, reject) => {
        this.logger.info(`EUMetSat.launchFetchJobs() : BEGIN`)

        let i = 1
        for(const elt of this.satelliteImagesList) {
            const jobName = `EUMetSat ${elt.id}`
            const firstRunAt = new Date( Date.now() + i*10*1000 )
            const eumetsat = this

            let lastScheduledJobAt = new Date()

            const job = this.jobScheduler.scheduleJob(jobName, firstRunAt, async function(moment :Date) {
                const job = this

                eumetsat.logger.info(`EUMetSat job '${job.name}' : Go [${moment.toISOString()}]`)

                let meta = await eumetsat.fetch(elt.url)

                const rescheduleAt = new Date(
                    Math.ceil(
                        (meta.lastModified.getTime() + elt.update_frequency * 1000
                            // Randomize within one tenth of the element update frequency hint.
                            + Math.floor(Math.random() * elt.update_frequency/10*1000))
                                /1000 /60
                    ) * 60 * 1000
                )

                // Prevent two consecutive jobs from being scheduled at the exact
                // same moment (fixme: very basic impl.)
                if (rescheduleAt === lastScheduledJobAt) {
                    rescheduleAt.setTime(
                        rescheduleAt.getTime() + Math.floor(Math.random() * 60*1000)
                    )
                }

                let ok = job.reschedule(rescheduleAt) === true
                assert(ok, `Whoops! Failed to re-schedule job ${job.name} ! [EUMetSat.launchFetchJobs()]`)

                lastScheduledJobAt = rescheduleAt

                eumetsat.logger.info(`Job ${job.name} rescheduled for '${job.nextInvocation().toISOString()}'.`)
            });

            this.logger.info(`EUMetSat: Scheduled first job '${job.name}' at ${job.nextInvocation().toISOString()}.`)

            i++
        }

        resolve(true)
    })
} // _eumetsat_launch_fetch_jobs //


// - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - -


/**
 * EUMetSat express app. bundle.
 *
 * @author fabic.net
 * @since 2018-02-02
 */
class EUMetSatApp
{
    logger   :Object
    jobScheduler :Object
    eumetsat :EUMetSat

    constructor (app :Function, path :string) {
        app.set('eumetsat', this)
        app.use(path, EUMetSatApp.Router())
        this.logger = app.get('app.logger')
        this.jobScheduler = NodeSchedule
        this.eumetsat = new EUMetSat(".", this.logger, this.jobScheduler)
        this.logger.info("Ich bin EUMetSatApp !")
        this.initialize()
    }

    initialize() {
        this.jobScheduler.scheduleJob('*/1 * * * *', () => {
            this.logger.info("Heyloo ?")
        });

        this.jobScheduler.scheduleJob('*/2 * * * *', function() {
            console.log('Hola!')
        });

        this.eumetsat.launchFetchJobs()
    }

    static Router () {
        let router = require('express').Router()

        /* GET home page. */
        router.get(/^.*$/, function(req, res, next) {
            let app = req.app
            let eumetsat = app.get('eumetsat')
            res.render('EUMetSat/index.html.njk', {
                title: 'Hey! dude!'
            })
        })

        return router
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function EUMetSatBundle(app :Function, path :string) {
    return new EUMetSatApp(app, path)
}

// EOF //