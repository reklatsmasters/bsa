const bitwise = require('./lib/bitwise')
const split = require('./lib/split')
const read = require('./lib/read')
const path = require('path')
const write = require('./lib/write')
const co = require('co')

module.exports = {
  // compress,
  extract,
  list
}

function list(buf) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('expected buffer')
  }

  const header = read.header(buf)

  if (!bitwise.get(header.archiveFlags, 1) || !bitwise.get(header.archiveFlags, 2)) {
    throw new Error(`Archive doesn't contains real names of folders or files`)
  }

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

function extract(buf, where) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('Argument 1 must be a Buffer')
  }

  where = where || '.'

  if (typeof where != 'string') {
    throw new TypeError('Argument 2 must be valid path to folder')
  }

  const header = read.header(buf)

  if (!bitwise.get(header.archiveFlags, 1) || !bitwise.get(header.archiveFlags, 2)) {
    throw new Error(`Archive doesn't contains real names of folders or files`)
  }

  const folder_record_size = 16
  var names

  return co(function* () {
    yield write.folder(where)

    /* read folders */
    for(let i = 0, folders_offset = 0, files_count = 0; i < header.folders; ++i) {
      const folder = read.folder(buf, folders_offset + header.offset)
      const tree = read.tree(buf, folder, folder.offset - header.totalFileNameLength + 1)

      /* read file names */
      if (i == 0) {
        const names_offset = tree.files[0].offset - header.totalFileNameLength
        names = split(buf.slice(names_offset, names_offset + header.totalFileNameLength), 0)
      }

      yield write.folder(tree.name)

      for(const file of tree.files) {
        /* join file name */
        const name = names[files_count].toString('ascii')

        /* read file data */
        const data = buf.slice(file.offset, file.offset + file.size)

        yield write.file(path.join(tree.name, name), data)
        ++files_count
      }

      folders_offset += folder_record_size
    }
  })
}
