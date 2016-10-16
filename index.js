// const bitwise = require('./lib/bitwise')
const split = require('./lib/split')
const read = require('./lib/read')
const path = require('path')

module.exports = {
  // compress,
  // extract,
  list
}

/**
 * API
 *
 * extract(buffer|stream, where [, opts]).then()
 * extract(where [,opts])  // fs.createReadStream('./Update.bsa').pipe(extract('.', {only: '*.dds'}))
 *
 * list(buffer|stream [,opts]).then()
 */

function list(buf, opts) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('expected buffer')
  }

  opts = opts || {}

  const header = read.header(buf)
  const folders = new Array(header.folders)

  /* read folders */
  for(let i = 0, folders_offset = 0; i < header.folders; ++i) {
    const folder = read.folder(buf, folders_offset + header.offset)
    const tree = read.tree(buf, folder, folder.offset - header.totalFileNameLength + 1)

    folders[i] = tree
    folders_offset += 16
  }

  /* read file names */
  const file_names_offset = folders[0].files[0].offset - header.totalFileNameLength
  const names = split(buf.slice(file_names_offset, file_names_offset + header.totalFileNameLength), 0)

  /* join folder names and file names */
  const files = new Array( names.length )

  for(let i = 0, files_count = 0; i < folders.length; ++i) {
    const folder = folders[i]

    for(let j = 0; j < folder.files.length; ++j,++files_count) {
      files[files_count] = path.join(folder.name, names[files_count].toString('ascii'))
    }
  }

  return files
}
