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
 * Extract all files from BSA archive.
 * @param {Buffer} bsafile BSA file.
 */
function* extract(bsafile) {
  if (!Buffer.isBuffer(bsafile)) {
    throw new TypeError('Argument 1 must be a Buffer');
  }

  const header = readHeader(bsafile);
  checkHeader(header);

  const tree = readFileTree(bsafile, header);

  for (const folder of tree) {
    for (const file of folder.files) {
      const start = file.offsetFileBlock + 4;
      const compressedFile = bsafile.subarray(start, file.fileSize + start);

      if (file.isCompressed) {
        const uncompressedFile = zlib.unzipSync(compressedFile);
        yield uncompressedFile;
      } else {
        yield compressedFile;
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
function extractFile(bsafile, index) {
  if (!Buffer.isBuffer(bsafile)) {
    throw new TypeError('Argument 1 must be a Buffer');
  }

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

    if (file.isCompressed) {
      const uncompressedFile = zlib.unzipSync(compressedFile);
      return uncompressedFile;
    }

    return compressedFile;
  }
}

function checkHeader(header) {
  if (header.version !== 103) {
    throw new Error('Invalid file version');
  }
}
