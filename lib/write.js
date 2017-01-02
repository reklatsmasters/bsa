'use strict'

const mkdir = require('mkdirp')
const then = require('pify')
const fs = require('fs')

const mkdirp  = then(mkdir)
const writeFileP = then(fs.writeFile)

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
  return mkdirp(path)
}

/**
 * write file
 * @param name {string}
 * @param data {Buffer}
 * @returns {Promise}
 */
function file(name, data) {
  return writeFileP(name, data, {encoding: null})
}
