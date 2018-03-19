'use strict'

import path from 'path'

// todo: have a config.local.js that we would merge here.

// module.exports = {

export const Config = {
  build: {},
  dev: {
    port: 3333,
    autoOpenBrowser: false,
  },

  public_dir: path.join(__dirname, '../public'),

  EUMetSat: {
    images_dir: path.join(__dirname, '../public/EUMetSat/'),
    launch_fetch_jobs: true
  }
}

export default Config
