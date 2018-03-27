'use strict'

/* @flow */

import { MongoClient, Db as MongoDb } from 'mongodb'
import logger from '../../misc/logger'
import assert from 'assert'

export default class DB
{
  _connectUrl :string
  _mclient    :MongoClient

  /**
   * TODO: use URL for building the MongoDB connection url string.
   *
   * @constructor
   * @param options {Object}
   */
  constructor(options :Object) {
    const user = options.user
    const pass = options.pass
    const host = options.host
    const port = options.port
    const   db = options.db
    const optionsQs = '' // todo?
    this._connectUrl = `mongodb://${user}:${pass}@${host}:${port}/${db}?${optionsQs}`
  }

  /**
   * http://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html
   *
   * @returns {Promise<MongoClient>}
   */
  async connect() {
    logger.info(`DB: Will attempt connect() with URL: ${this._connectUrl}`)
    return MongoClient.connect(this._connectUrl, /* options */ {
        // logger: logger, // fixme.
        loggerLevel: 'info'
      })
      .then((mclient :MongoClient) => {
        logger.info("DB: Connected.")
        this._mclient = mclient
        return mclient
      })
  }

  /**
   *
   * @returns {MongoClient|null}
   */
  get client() : MongoClient {
    assert(this._mclient instanceof MongoClient) // i.e. not null.
    return this._mclient
  }

  /**
   * @returns {Promise<any>}
   */
  closeConnection() {
    return this.client.close()
      .finally(() => {
        logger.info("DB: Closed connection.")
      })
  }

  /**
   * @param dbName {string|null}
   * @returns {MongoDb}
   */
  db(dbName :string|null) {
    return this.client.db(dbName)
  }
}