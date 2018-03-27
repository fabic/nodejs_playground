'use strict'

// import path from 'path'
// ^ Can't: babel won't process the contents of this `config/` dir.
const path = require ('path')

// todo: have a config.local.js that we would merge here.

//export const Config = {
let Config = {
  build: {},
  dev: {
    port: 3333,
    autoOpenBrowser: false,
  },

  public_dir: path.join(__dirname, '../public'),

  EUMetSat: {
    images_dir: path.join(__dirname, '../public/EUMetSat/'),
    launch_fetch_jobs: false
  },

  // For class DB @ `src/bundles/db/index.js`.
  database: {
       host: 'localhost',
       port: 27017,
         db: 'fabi',
       user: 'fabi',
       pass: 'haiku',
    options: {} // todo: options handling not impl.
  }
}

// export default Config
module.exports = Config
