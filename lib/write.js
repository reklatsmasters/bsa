'use strict'

const mkdir = require('mkdirp')
const then = require('es6-promisify')
const fs = require('fs')

module.exports = {
  folder,
  file
}

/**
 * create folder
 * @param path {string}
 * @returns {Promise}
 */
function folder(path) {
  return then(mkdir)(path)
}

/**
 * write file
 * @param name {string}
 * @param data {Buffer}
 * @returns {Promise}
 */
function file(name, data) {
  return then(fs.writeFile)(name, data, {encoding: null})
}
