'use strict'

const nullstr = require('./nullstr')

module.exports = {
  header,
  folder,
  tree
}

/**
 * read file header
 * @param buf {Buffer}
 */
function header(buf) {
  const sign = buf.slice(0, 3)  // must be "BSA"
  const version = buf.readUInt32LE(4) // 0x67 for TES 4, 0x68 for TES 5
  const offset = buf.readUInt32LE(8)  // Offset of beginning of folder records.
  const archiveFlags = buf.readUInt32LE(12)

  const folders = buf.readUInt32LE(16)
  const files = buf.readUInt32LE(20)
  const totalFolderNameLength = buf.readUInt32LE(24)
  const totalFileNameLength = buf.readUInt32LE(28)
  const fileFlags = buf.readUInt32LE(32)

  return {
    sign,
    version,
    offset,
    archiveFlags,
    folders,
    files,
    totalFolderNameLength,
    totalFileNameLength,
    fileFlags
  }
}

/**
 * read folder info block
 * @param buf {Buffer}
 */
function folder(buf, offset) {
  offset = offset >>> 0

  const hash = buf.slice(offset, offset + 8)
  const count = buf.readUInt32LE(offset + 8)
  const folder_offset = buf.readUInt32LE(offset + 12)

  return {
    hash,
    count,
    offset: folder_offset
  }
}

/**
 * read files for provided folder
 * @param buf {Buffer}
 * @param folder {object} folder object from folder() associated with this tree
 */
function tree(buf, folder, offset) {
  offset = offset >>> 0

  const files = new Array(folder.count)
  const name = nullstr(!offset ? buf : buf.slice(offset)).toString('ascii')

  const start = offset + name.length + 1
  buf = buf.slice(start, start + files.length * 16)

  for(var i = 0; i < files.length; ++i) {
    files[i] = {
      size: buf.readUInt32LE(i * 16 + 8),
      offset: buf.readUInt32LE(i * 16 + 12)
    }
  }

  return {
    name,
    size: name.length + 1 /* \0 */ + files.length * 16,
    files
  }
}
