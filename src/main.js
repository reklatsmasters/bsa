import path from 'node:path';
import zlib from 'node:zlib';
import { readHeader, readFileTree } from './reader.js';

export { list, list as ls, extract, extractFile };

/**
 * Get the list of the files in provided BSA file.
 * @param {Buffer} bsafile BSA file.
 */
function list(bsafile) {
  if (!Buffer.isBuffer(bsafile)) {
    throw new TypeError('Argument 1 must be a Buffer');
  }

  const header = readHeader(bsafile);
  checkHeader(header);

  const tree = readFileTree(bsafile, header);

  return tree.flatMap((folder) => {
    return folder.files.map((file) => {
      const fileName = file.fileName ?? BigInt(file.fileHash).toString(16);
      return path.win32.join(folder.folderName, fileName);
    });
  });
}

/**
 * Keeps metadata of an extracted file.
 */
class BSAFileMetadata {
  #fileName;
  #filePath;
  #data;

  constructor(data, fname, fpath) {
    this.#data = data;
    this.#fileName = fname;
    this.#filePath = fpath;
  }

  /**
   * @returns {string|null}
   */
  get fileName() {
    return this.#fileName;
  }

  /**
   * @returns {string|null}
   */
  get filePath() {
    return this.#filePath;
  }

  /**
   * @returns {Buffer}
   */
  get data() {
    return this.#data;
  }
}

/**
 * Extract all files from BSA archive.
 * @param {Buffer} bsafile BSA file.
 */
function* extract(bsafile, options = {}) {
  if (!Buffer.isBuffer(bsafile)) {
    throw new TypeError('Argument 1 must be a Buffer');
  }

  const { keepFileMetadata } = {
    keepFileMetadata: false,
    ...options,
  };

  const header = readHeader(bsafile);
  checkHeader(header);

  const tree = readFileTree(bsafile, header);

  for (const folder of tree) {
    for (const file of folder.files) {
      const start = file.offsetFileBlock + 4;
      const compressedFile = bsafile.subarray(start, file.fileSize + start);

      const targetFile = file.isCompressed
        ? zlib.unzipSync(compressedFile)
        : compressedFile;

      if (keepFileMetadata) {
        const fileName = file.fileName ?? BigInt(file.fileHash).toString(16);
        yield new BSAFileMetadata(targetFile, fileName, folder.folderName);
      } else {
        yield targetFile;
      }
    }
  }
}

/**
 * Extract file from archive.
 * @param {Buffer} bsafile BSA file.
 * @param {number} index Index of file to extract.
 * @returns {Buffer}
 */
function extractFile(bsafile, index, options = {}) {
  if (!Buffer.isBuffer(bsafile)) {
    throw new TypeError('Argument 1 must be a Buffer');
  }

  const { keepFileMetadata } = {
    keepFileMetadata: false,
    ...options,
  };

  const header = readHeader(bsafile);
  checkHeader(header);

  if (index >= header.totalFiles) {
    throw new Error('Invalid file index to extract');
  }

  const tree = readFileTree(bsafile, header);
  let counter = 0;

  for (const folder of tree) {
    counter += folder.totalFiles;

    if (index >= counter) {
      continue;
    }

    const i = index - (counter - folder.totalFiles);
    const file = folder.files[i];
    const start = file.offsetFileBlock + 4;
    const compressedFile = bsafile.subarray(start, file.fileSize + start);

    const targetFile = file.isCompressed
      ? zlib.unzipSync(compressedFile)
      : compressedFile;

    if (keepFileMetadata) {
      const fileName = file.fileName ?? BigInt(file.fileHash).toString(16);
      return new BSAFileMetadata(targetFile, fileName, folder.folderName);
    }

    return targetFile;
  }
}

function checkHeader(header) {
  if (header.version !== 103) {
    throw new Error('Invalid file version');
  }
}
