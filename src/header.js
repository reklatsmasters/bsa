import { getBit, setBit } from './bitwise.js';

const HEADER_SIZE = 36;

/**
 * Archive flags for file v0x67
 */
class BSAHeaderFlagsOblivion {
  hasFolderNames;
  hasFileNames;
  isCompressed;
  retainFolderNames;
  retainFileNames;
  retainFileNameOffsets;
  isBigEndian;
  omitFileNames;
  embedFileNames = true;
  bit10 = true;
  bit11 = true;

  /**
   * @constructor
   * @param {number} flags Archive flags
   */
  constructor(flags = 0) {
    this.hasFolderNames = getBit(flags, 1);
    this.hasFileNames = getBit(flags, 2);
    this.isCompressed = getBit(flags, 3);
    this.retainFolderNames = getBit(flags, 4);
    this.retainFileNames = getBit(flags, 5);
    this.retainFileNameOffsets = getBit(flags, 6);
    this.isBigEndian = getBit(flags, 7);
    this.omitFileNames = getBit(flags, 8);
    this.embedFileNames = getBit(flags, 9);
    this.bit10 = getBit(flags, 10);
    this.bit11 = getBit(flags, 11);
  }

  toNumber() {
    let value = 0;

    if (this.hasFolderNames) {
      value = setBit(value, 1);
    }

    if (this.hasFileNames) {
      value = setBit(value, 2);
    }

    if (this.isCompressed) {
      value = setBit(value, 3);
    }

    if (this.retainFolderNames) {
      value = setBit(value, 4);
    }

    if (this.retainFileNames) {
      value = setBit(value, 5);
    }

    if (this.retainFileNameOffsets) {
      value = setBit(value, 6);
    }

    if (this.isBigEndian) {
      value = setBit(value, 7);
    }

    if (this.omitFileNames) {
      value = setBit(value, 8);
    }

    if (this.embedFileNames) {
      value = setBit(value, 9);
    }

    if (this.bit10) {
      value = setBit(value, 10);
    }

    if (this.bit11) {
      value = setBit(value, 11);
    }

    return value;
  }

  valueOf() {
    return this.toNumber();
  }
}

/**
 * BSA file header structure.
 */
export class BSAHeader {
  version = 0;
  offsetFolders = HEADER_SIZE; // Offset of beginning of folder records.
  /** @type {BSAHeaderFlagsOblivion} */
  flags = 0; // Arcgive flags
  totalFolders = 0; // The number of all folders in archive
  totalFiles = 0; // The number of all files in archive.
  totalFolderNameLength = 0; // Total length of all folder names, including \0's
  totalFileNameLength = 0; // Total length of all file names, including \0's.
  contentType = 0; // Content type flags

  constructor(flags = 0) {
    this.flags = new BSAHeaderFlagsOblivion(flags);
  }
}

/**
 * BSA content type flags.
 */
export class BSAContentType {
  meshes = 0;
  textures = 0;
  menus = 0;
  sounds = 0;
  voices = 0;
  shaders = 0;
  trees = 0;
  fonts = 0;
  miscellaneous = 0;

  /**
   * @constructor
   * @param {number} flags
   */
  constructor(flags = 0) {
    this.meshes = getBit(flags, 1);
    this.textures = getBit(flags, 2);
    this.menus = getBit(flags, 3);
    this.sounds = getBit(flags, 4);
    this.voices = getBit(flags, 5);
    this.shaders = getBit(flags, 6);
    this.trees = getBit(flags, 7);
    this.fonts = getBit(flags, 8);
    this.miscellaneous = getBit(flags, 9);
  }
}
