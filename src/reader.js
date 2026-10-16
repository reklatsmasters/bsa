import zlib from 'node:zlib';
import { BSAHeader, BSAContentType } from './header.js';
import { FileRecord, FolderRecord } from './file.js';
import { getBit } from './bitwise.js';

const FILE_HEADER = 4_281_154;
const MAX_FILE_SIZE = 0x7f_ff_ff_ff;

/**
 * Read file header.
 * @param {Buffer} file Raw bsa file.
 */
export function readHeader(file) {
  let offset = 0;

  const fileHeader = file.readUInt32LE(offset);
  offset += 4;

  if (fileHeader !== FILE_HEADER) {
    throw new Error('Invalid file');
  }

  const fileVersion = file.readUInt32LE(offset);
  offset += 4;

  const header = new BSAHeader(file.readUInt32LE(offset + 4));
  header.version = fileVersion;

  header.offsetFolders = file.readUInt32LE(offset);
  offset += 8;

  header.totalFolders = file.readUInt32LE(offset);
  offset += 4;

  header.totalFiles = file.readUInt32LE(offset);
  offset += 4;

  header.totalFolderNameLength = file.readUInt32LE(offset);
  offset += 4;

  header.totalFileNameLength = file.readUInt32LE(offset);
  offset += 4;

  header.contentType = new BSAContentType(file.readUInt32LE(offset));

  return header;
}

/**
 * Read NULL-terminated string.
 * @param buf {Buffer}
 * @param start {number}
 * @returns {Buffer}
 */
function nullstr(buf, start = 0) {
  let end = buf.indexOf(0, start);

  if (end === -1) {
    end = buf.length;
  }

  return buf.subarray(start, end);
}

/**
 * Read folder record.
 * @param {Buffer} file BSA file.
 * @param {BSAHeader} header
 * @param {number} offset Bytes offset.
 * @param {FolderRecord} folder
 * @returns {number} Offset to file records.
 */
function readFolder(file, header, offset, folder) {
  folder.folderHash = file.readBigUInt64LE(offset);
  folder.totalFiles = file.readUInt32LE(offset + 8);
  folder.offsetFileNames =
    file.readUInt32LE(offset + 12) - header.totalFileNameLength + 1;

  let offsetFileRecords = folder.offsetFileNames;

  if (header.flags.hasFolderNames) {
    const bFolderName = nullstr(file, folder.offsetFileNames);
    folder.folderName = bFolderName.toString('ascii');

    offsetFileRecords += bFolderName.byteLength + 1;
  }

  return offsetFileRecords;
}

/**
 * Get the names of files, one by one.
 * @param {Buffer} bsafile BSA file.
 * @param {BSAHeader} header
 * @param {number} offset
 */
function* getFileNames(bsafile, header, offset) {
  for (let i = 0; i < header.totalFiles; ++i) {
    const bFileName = nullstr(bsafile, offset);
    offset += bFileName.byteLength + 1;

    yield bFileName.toString('ascii');
  }
}

/**
 * Read file record.
 * @param {Buffer} bsafile
 * @param {BSAHeader} header
 * @param {number} offset
 * @param {FileRecord} file
 * @returns {number}
 */
function readFile(bsafile, header, offset, file) {
  file.fileHash = bsafile.readBigUInt64LE(offset);
  const fileSize = bsafile.readUInt32LE(offset + 8);

  // eslint-disable-next-line no-bitwise
  file.fileSize = fileSize & MAX_FILE_SIZE;
  file.offsetFileBlock = bsafile.readUInt32LE(offset + 8 + 4);

  const { isCompressed } = header.flags;
  file.isCompressed = getBit(fileSize, 31) ? !isCompressed : isCompressed;

  return file.offsetFileBlock;
}

/**
 * Read file tree.
 * @param {Buffer} file Raw bsa file.
 * @param {BSAHeader} header File header.
 */
export function readFileTree(file, header) {
  const foldersTree = [];
  let listFileNames = null;

  for (let i = 0; i < header.totalFolders; i++) {
    const folder = new FolderRecord();
    foldersTree.push(folder);

    const offset = header.offsetFolders + i * 16;
    const offsetFileRecords = readFolder(file, header, offset, folder);

    for (let index = 0; index < folder.totalFiles; index++) {
      const fileRecord = new FileRecord();
      folder.files.push(fileRecord);

      const localOffset = offsetFileRecords + 16 * index;
      readFile(file, header, localOffset, fileRecord);

      if (!header.flags.omitFileNames) {
        listFileNames ||= getFileNames(
          file,
          header,
          fileRecord.offsetFileBlock - header.totalFileNameLength,
        );

        fileRecord.fileName = listFileNames.next().value;
      }
    }
  }

  return foldersTree;
}

/**
 * BSA file data.
 */
class _BSAFileData {
  isCompressed;
  file;
  fileName;

  /**
   * @constructor
   * @param {Buffer} data File data.
   * @param {boolean} isCompressed Check is file compressed.
   */
  constructor(data, isCompressed) {
    if (!Buffer.isBuffer(data)) {
      throw new TypeError('Invalid argument 1');
    }

    this.file = data;
    this.isCompressed = isCompressed;
  }

  /**
   * Compress the file.
   * @param {Function} callback
   */
  toCompressed(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (this.isCompressed) {
      queueMicrotask(() => callback(null, this.file));
    } else {
      zlib.gzip(this.file, callback);
    }
  }

  /**
   * Decompress the file.
   * @param {Function} callback
   */
  toDecompressed(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (this.isCompressed) {
      zlib.unzip(this.file, callback);
    } else {
      queueMicrotask(() => callback(null, this.file));
    }
  }
}

/**
 * Represend BSA file structure.
 */
export class BSArchive {
  header;

  /**
   * @constructor
   * @param {BSAHeader} header
   */
  constructor(header) {
    this.header = header;
  }
}

/**
 * Read BSA file structure.
 * @param {Buffer} bsafile
 */
export function readBSArchive(bsafile) {
  const header = readHeader(bsafile);
  const archive = new BSArchive(header);

  return archive;
}
