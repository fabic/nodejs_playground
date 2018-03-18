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
        { id: "MPE_West_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_MPE_WestIndianOcean.png", update_frequency: 15*60, type: "Visualised Products" },
        { id: "MPE_East_IndianOcean", url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_MPE_EastIndianOcean.png", update_frequency: 15*60, type: "Visualised Products" },
        // Nothing to see on these.
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_FIR_WestIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_FIR_EastIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },
        // “Wind gradient arrows drawn on grey map” :
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_AMV_WestIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },
        // { url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_AMV_EastIndianOcean.png", update_frequency: 15*60, type: "Visualised Products },

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
                this.logger.error("Huh! we shall NOT receive any data as part of a HEAD HTTP request !")
            });

            res.on('end', () => {
                this.logger.debug(` \` Got HTTP headers for resource at '${url}'.  [EUMetSat.probeResourceAt()]`);
                let headers = Object.assign({
                    _url: _url,
                    _fileName: _url.pathname.substr(_url.pathname.lastIndexOf('/')+1) ||
                    "_eumetsat_probe_res__error_inferring_file_name"
                }, res.headers)
                resolve( headers )
            });
        });

        req.on('error', (e) => {
            this.logger.error(` \` Problem with request: ${e.message}  [EUMetSat.probeResourceAt()]`);
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

        // Infer file name from the resource url in case it wasn't specified.
        saveFileName = saveFileName || (this.imagesDirectory + PATHSEP
            + (options.path.substr(options.path.lastIndexOf('/') + 1) ||
                "_eumetsat_fetch_error_couldnt_infer_image_filename"))

        const req = http.request(options, (res) => {
            this.logger.info(` \` Fetching resource at ${url}, saving to file '${saveFileName}'.  [EUMetSat.fetchResourceAt()]`)
            this.logger.debug(` \` STATUS: ${res.statusCode}`);
            this.logger.debug(` \` HEADERS: ${JSON.stringify(res.headers)}`);
            this.logger.info(` \` Creating file '${saveFileName}'.  [EUMetSat.fetchResourceAt()]`)

            const file = fs.createWriteStream(saveFileName, { encoding: 'binary' })

            res.setEncoding('binary');

            res.on('data', (chunk) => {
                file.write(chunk, 'binary')
                this.logger.debug(` \` Writing chunk to file ${saveFileName}...  [EUMetSat.fetchResourceAt()]`)
            });

            res.on('end', () => {
                this.logger.debug(' \` No more data in response. [EUMetSat.fetchResourceAt()]');
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

            delete headers._url
            delete headers._fileName

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
                    else if (err) {
                        this.logger.error(`EUMetSat.fetch('${url}') : Failure while stat-ing file '${meta.saveFileName}'.`)
                        reject(err)
                    }
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
            else {
                return meta
            }
        })
        // #4 : Drop a few lines through the log for information.
        .then((meta :Object) => {
            this.logger.debug(meta)
            return meta
        })
        .finally(() => {
            this.logger.debug(`EUMetSat.fetch('${url}') : END.`)
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

/**
 *
 * @returns {Promise<any>}
 */
EUMetSat.prototype.launchFetchJobs = function _eumetsat_launch_fetch_jobs()
{
    return new Promise((resolve, reject) => {
        this.logger.info(`EUMetSat.launchFetchJobs() : BEGIN`)

        let i = 1
        for(const elt of this.satelliteImagesList)
        {
            const jobName = `EUMetSat ${elt.id}`
            const firstRunAt = new Date( Date.now() + i*15*1000 + Math.ceil(Math.random() * 10))
            const eumetsat = this

            let lastScheduledJobAt = new Date()

            const job = this.jobScheduler.scheduleJob(jobName, firstRunAt,
                async function (moment: Date) {
                    const job = this

                    eumetsat.logger.info(`EUMetSat job '${job.name}' : BEGIN  [${moment.toISOString()}]`)

                    let meta = null
                    let rescheduleAt = null
                    let rescheduleRandomDelay = 0

                    try {
                        meta = await eumetsat.fetch(elt.url)
                    }
                    /* EUMetSat.fetch() does not catch errors, typically these
                     * are inet connectivity problems like DNS resolution, connection
                     * refused or whatever.
                     *
                     * => Hence we're rescheduling this job to run shortly.
                     *
                     * TODO: See if we need to care about non-inet related errors
                     * TODO: like for ex. file creation/write errors (e.g. disk space exhaustion).
                     * TODO: Or may handle non-inet error as fatal, either here or within fetch*() ?
                     */
                    catch(ex) {
                        rescheduleRandomDelay = Math.ceil(Math.random() * 30*60)
                        rescheduleAt = new Date(
                            Math.ceil(
                                (moment.getTime() + 15*60*1000 + rescheduleRandomDelay * 1000)
                                / 1000 / 60
                            ) * 60 * 1000
                        )

                        let reschedOk = job.reschedule(rescheduleAt) === true

                        eumetsat.logger.warn(`(!) Ouch! Caught exception thrown from within EUMetSat.fetch().  [Job: ${job.name}]`)
                        eumetsat.logger.warn(`(!) \` Re-scheduling job ${job.name} rescheduled for '${job.nextInvocation().toISOString()}'.`)

                        assert(reschedOk, `Whoops! Failed to re-schedule job ${job.name} for '${rescheduleAt.toISOString()}' ! [EUMetSat.launchFetchJobs()]`)
                        return
                    }

                    // If no file was fetched => resource may not have been updated
                    // on the server => Reschedule a run sometime within this moment
                    // and before the next expected update of the resource.
                    if (! meta.mustFetchNewerResource) {
                        const nextUpdateExpectedAt = new Date(Math.ceil((meta.lastModified.getTime() + elt.update_frequency * 1000) /1000/60) *60 *1000)

                        eumetsat.logger.warn(` \` Got no file, last-modified: ${meta.lastModified.toISOString()}, next update would be by: ${nextUpdateExpectedAt.toISOString()}.`)

                        let remainsTilNextUpdate = Math.ceil(nextUpdateExpectedAt.getTime()/1000 - moment.getTime()/1000)
                        eumetsat.logger.info(` \` Next resource update is ${remainsTilNextUpdate} seconds away (${nextUpdateExpectedAt.toISOString()}), computing a reschedule before it occurs.`)

                        if (remainsTilNextUpdate <= 0) {
                            remainsTilNextUpdate = 15*60
                            eumetsat.logger.warn(`   \` (!) Next expected resource update is *before* this moment, forcing to ${remainsTilNextUpdate} seconds.`)
                        }

                        let medianOffset = Math.ceil(remainsTilNextUpdate / 2)

                        // as to adhere to EUMetSat data policy.
                        // Prevent rescheduling under the 15 minutes threshold so
                        const threshold = 15 * 60
                        if (medianOffset < threshold) {
                            eumetsat.logger.warn(`   \` (!) Computed offset (${medianOffset} secs) is less than ${threshold/60} minutes, forcing value.`)
                            medianOffset = threshold
                        }

                        rescheduleRandomDelay = Math.ceil(Math.random() * 60)
                        rescheduleAt = new Date(
                            Math.ceil((moment.getTime() + medianOffset * 1000 + rescheduleRandomDelay * 1000)
                                /1000 /60) *60 *1000 /* Round to the nearest minute. */ )

                        eumetsat.logger.warn(`   \` Re-scheduling job for '${rescheduleAt.toISOString()}'  [${job.name}]`)
                    }
                    // Ok, we fetched the newer resource, reschedule based on the update frequency hint.
                    else {
                        assert(meta.file != null)
                        eumetsat.logger.info(` \` Got new file '${meta.saveFileName}', last-modified: ${meta.lastModified.toISOString()}`)
                        // Randomize within one tenth of the element update frequency hint.
                        rescheduleRandomDelay = Math.ceil(Math.random() * (elt.update_frequency / 10))
                        rescheduleAt = new Date(
                            Math.ceil((meta.lastModified.getTime()
                                        + elt.update_frequency * 1000
                                        + 60*1000 /* plus one minute. */)
                                            /1000 /60) *60 *1000)
                    }

                    // It may happen that the job was re-scheduled "in the past",
                    // typically on the first job-runs where we're probing/fetching
                    // resources "out-of-sync".
                    if (rescheduleAt <= moment) {
                        eumetsat.logger.warn(` \` Will re-schedule job ${job.name} as it was scheduled in the past: ${rescheduleAt.toISOString()}, now: ${moment.toISOString()}.`)
                        rescheduleRandomDelay = Math.ceil(Math.random() * 60)
                        rescheduleAt = new Date(
                            Math.ceil((moment.getTime() + 5*1000)
                                /1000 /60) *60 *1000)
                        eumetsat.logger.warn(`   \` Came up with: ${rescheduleAt.toISOString()}.`)
                    }

                    // Prevent two consecutive jobs from being scheduled at the exact
                    // same moment (fixme: very basic impl.)
                    if (rescheduleAt === lastScheduledJobAt) {
                        rescheduleRandomDelay = Math.ceil(Math.random() * 60);
                        rescheduleAt.setTime(rescheduleAt.getTime())
                        eumetsat.logger.warn(` \` Had to delay this job a little bit  [${job.name}]`)
                    }

                    // We do want the above logic to come up with some delay amount,
                    // and we require at least a 10 seconds delay.
                    if (rescheduleRandomDelay <= 10) {
                        rescheduleRandomDelay += 10 + Math.ceil(Math.random() * 60)
                        eumetsat.logger.warn(` \` (!) Introducing last minute delay by ${rescheduleRandomDelay} seconds.`)
                    }

                    rescheduleAt.setTime(rescheduleAt.getTime() + rescheduleRandomDelay * 1000)

                    let ok = job.reschedule(rescheduleAt) === true
                    assert(ok, `Whoops! Failed to re-schedule job ${job.name} for '${rescheduleAt.toISOString()}' ! [EUMetSat.launchFetchJobs()]`)

                    lastScheduledJobAt = rescheduleAt

                    eumetsat.logger.info(`\` Ok, job ${job.name} rescheduled for '${job.nextInvocation().toISOString()}' [last-modified: ${meta.lastModified.toISOString()}, delay: ${rescheduleRandomDelay} seconds].`)
                    eumetsat.logger.info(`   \`~> 'tis about ~${Math.ceil((job.nextInvocation().getTime() - Date.now())/1000/60)} minutes from now.`)
                    eumetsat.logger.info(" ` - - -")
                    eumetsat.logger.info("")
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
        // For debugging
        this.jobScheduler.scheduleJob("One minute ticker", '0 */1 * * * *', (moment :Date) => {
            this.logger.info(`~~> Heyloo, +1 min., 'tis ${moment.toISOString()}`)
        });

        // Output the list of jobs to the logs, every 10 minutes.
        this.jobScheduler.scheduleJob("Job periodic lister", '0 */10 * * * *', (moment :Date) => {
            this.logger.info("")
            this.logger.info("+- - -")
            this.logger.info(`| Hola! 'tis ${moment.toISOString()}, here's the list of jobs :`)
            Object.entries(this.jobScheduler.scheduledJobs)
                .map((pair) => pair[1])
                .sort((job_a :NodeSchedule.Job, job_b :NodeSchedule.Job) => {
                    // return job_a.nextInvocation() - job_b.nextInvocation()
                    // ^ nextInvocation() mays return NULL -_-
                    const a = job_a.nextInvocation() || new Date(0)
                    const b = job_b.nextInvocation() || new Date(0)
                    return a - b
                })
                .forEach((job :NodeSchedule.Job, index) => {
                    const at :Date = job.nextInvocation()
                    this.logger.info(`| #${index+1}  ${at != null ? at.toISOString() : 'NULL'}  ${job.name}`)
                })
            this.logger.info("+- - -")
            this.logger.info("")
        });

        this.eumetsat.launchFetchJobs()
        // todo: handle the returned promise ?
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