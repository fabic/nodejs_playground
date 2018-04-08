#!/usr/bin/env node

/* @flow */

import       assert from 'assert'
import          cli from 'cli'
import      _logger from '../misc/logger'
import       _https from "https"
import         _dns from "dns"
import            _ from 'lodash'
import NodeSchedule from "node-schedule"

import Config from '../../config'
import {URL} from "url";

'use strict'

/**
 * Basic queries over the Godaddy API. Initial purpose is to write a DNS record
 * updater for having `laptop.fabic.net` point to my most recent public IP.
 *
 * * <https://developer.godaddy.com/doc/endpoint/domains>
 * * <https://developer.godaddy.com/keys>
 * * <https://developer.godaddy.com/getstarted>
 * * <https://fr.godaddy.com/community/Managing-Domains/Dynamic-DNS-Updates/td-p/7862>
 *
 * @author fabic.net
 * @since 2018-03-29
 */
class Godaddy
{
     dns :any
   https :any
  logger :any

  /**
   * Ctor
   */
  constructor() {
    this.dns    = _dns
    this.https  = _https
    this.logger = _logger
  }

  /**
   * Basic helper for issuing HTTPS request to the Godaddy API endpoint.
   *
   * @param method {string} GET|PUT|PATCH|...
   * @param uri {string} Ex. "/v1/domains/fabic.net/records/A/laptop"
   * @param data {mixed} Typically: `[{ ... }, ...]` that gets sent as JSON.
   * @param headers {Object}
   *
   * @returns {Promise<{}>}
   */
  request(method :string, uri :string, data :mixed = null, headers :Object = {})
  {
    return new Promise((resolve, reject) => {
      let body :?string = null

      if (data instanceof Object) {
        try {
          body = JSON.stringify(data); // todo: try-catch
        }
        catch (ex) {
          this.logger.info(`Body ain't a javascript object`)
          assert(body === null)
        }
      }

      if (body === null) {
        this.logger.warn(`Body data wasn't some JS object, converting to string now, beware!`)
        body = "" + data
      }

      headers = Object.assign(headers, {
        Authorization: "sso-key XXXX:ZZZZ",       // PRODUCTION KEY
        // Authorization: "sso-key XXXX:ZZZZ", // TEST KEY
        Connection: 'keep-alive',
        Accept: 'application/json'
      })

      // (!) It appears we must send a Content-Length or Godaddy will reject
      //     the request as malformed / bad request.
      if (body) {
        headers['Content-Length'] = body.length
      }

      method = method.toUpperCase()

      let options = {
        protocol: 'https:', // default.
        hostname: "api.godaddy.com",
        // hostname: "localhost", port: 4444,
        path: uri,
        method: method,
        headers: headers
      }

      this.logger.info(`Issuing HTTP request: ${options.method} ${options.protocol}//${options.hostname}${options.path}`)

      const request = this.https.request(options, (response) => {
        this.logger.debug(` \` STATUS: ${response.statusCode}`)
        this.logger.debug(` \` HEADERS: ${JSON.stringify(response.headers)}`)

        // TODO: find out if we need to parse the Content-Type header or not.
        // TODO: before issuing `res.setEncoding('utf8')`

        let body = ""

        response.on('data', (chunk) => {
          body += chunk
        });

        response.on('end', () => {
          let data = null
          let isBodyJSON = null

          try {
            data = JSON.parse(body)
            isBodyJSON = true
          } catch(e) {
            isBodyJSON = false
            this.logger.warn("Could not parse response body as a valid JSON string: " + body)
          }

          resolve({
            status:  response.statusCode,
            headers: response.headers,
            body: body,
            is_json_body: isBodyJSON,
            data: data
          })
        })// on response end //
      }) // https.request() //

      request.on('error', (e) => {
        this.logger.error(` \` Problem with request: ${e.message}  [EUMetSat.probeResourceAt()]`);
        reject(e)
      })

      if (body) {
        this.logger.info(`Sending body (${body.length} bytes): ${body}`)
        request.write( body )
      }

      request.end()
    })
  } // request() //

  domains() {
    return this.request('GET', '/v1/domains')
      .then((response) => {
        console.log(response)
        return response
      })
  }

  records(domain :string, type :?string, name :?string) {
    let uri = `/v1/domains/${domain}/records`
      + (type ? (name ? `/${type}/${name}` : `/${type}`) : '')
    return this.request('GET', uri)
      .then((response) => {
        return response
      })
  }

  updateRecords(domain :string, type :string, name :string, data :Array<Object>) {
    const uri = `/v1/domains/${domain}/records/${type}/${name}`
    const headers = {'Content-Type': 'application/json'}
    return this.request('PUT', uri, data, headers)
      .then((response) => {
        return response
      })
  }

  /**
   * Attempt to resolve our public IP address by querying __OpenDNS.com__.
   *
   * Basically this performs:
   * `$ dig +short myip.opendns.com @resolver1.opendns.com`
   *
   * todo: resolve reverse PTR too ?
   * todo: refactor as a generic resolver ?
   *
   * @returns {Promise<string>}
   */
  resolveMyIpOpenDNS() {
    return new Promise((resolve, reject) => {
      const dnsServerName = "resolver1.opendns.com"
      this.logger.info(`Finding out our public IP by querying ${dnsServerName}`)

      this.dns.lookup(dnsServerName, {
             all: true,
        verbatim: true,
      }, (err, addresses) => {
        if (err) {
          reject(err)
        }

        const addrs :string[] = addresses.map((addr) => addr.address)

        this.logger.info(`Resolved ${dnsServerName} IP addresses: ${addrs.join(', ')}`)

        const resolver = new this.dns.Resolver()
        resolver.setServers(addrs)

        // This request will use the server at 4.4.4.4, independent of global settings.
        resolver.resolve4("myip.opendns.com", {
          ttl: false
        }, (err, addresses :string[]) => {
          if (addresses.length === 0) {
            reject(new Error(`Failed to resolve our public IP address, server ${dnsServerName} returned no address.`))
          }
          assert(addresses.length === 1)
          const publicAddress = addresses[0]
          this.logger.info(`Ok, resolved our public IP address: ${publicAddress}`)
          resolve( publicAddress )
        }) // resolver.resolve4() //
      }) // dns.lookup() //
    }) // Promise //
  } // resolveMyIpOpenDNS() method //
} // Godaddy class. //


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


cli.info("HEY!")
cli.enable('status')
cli.parse({
  file: [ 'f', 'A file to process', 'file', null ],
  time: [ 't', 'An access time', 'time', false],
  work: [ false, 'What kind of work to do', 'string', 'sleep' ],
}, ['domains', 'records', 'update']);


(async () => {
  const gapi = new Godaddy()

  if (cli.command === 'domains') {
    let dms = await gapi.domains()
  }

  else if (cli.command === 'records') {
    let records = await gapi.records('fabic.net', 'A', 'laptop')
    console.log(records)
  }

  // todo: resolve SOA -> query NS -> resolve public IP -> compare -> update if needed.
  else if (cli.command === 'update') {
    gapi.resolveMyIpOpenDNS()
      .then(async (publicAddress :string) => {
        let records = await gapi.updateRecords('fabic.net', 'A', 'laptop',
          [{"data": publicAddress, "ttl": 600 /* min. acceptable TTL (?) */ }])
        console.log(records)
      })
  }

})();

// EOS //