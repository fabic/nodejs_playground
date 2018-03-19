'use strict'

import path from 'path'


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
  }
}

export default Config
