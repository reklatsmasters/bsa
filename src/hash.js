/* eslint-disable no-bitwise */
import * as path from 'node:path';

/**
 * Bethesda BSA hash calculation.
 * @link https://en.uesp.net/wiki/Oblivion_Mod:Hash_Calculation
 *
 * The 64-bit hash is composed of two 32-bit halves:
 *   - the high half is `hash2 + hash3`, where `hash2` is a polynomial
 *     (`* 0x1003F`) over the "middle" of the name (all characters except the
 *     first one and the last two) and `hash3` is the same polynomial over the
 *     extension (including the leading dot);
 *   - the low half packs the length, the first two and the last character of
 *     the name plus a bit flag for a few special extensions.
 *
 * Folder records are hashed over the folder path; file records are hashed over
 * the file name only (without the directory part and without grouping folders).
 */

const POLY = 0x1_00_3f;
const MAX_NAME_LENGTH = 0xff;

/**
 * Normalize a BSA path: forward slashes become backslashes and everything is
 * converted to lower case. Trailing/leading slashes are trimmed for folders.
 * @param {string} filePath
 * @returns {string}
 */
function normalize(filePath) {
  return path.win32.normalize(filePath).toLowerCase();
}

/**
 * Split a name into the part used for the polynomial hash and the extension
 * (including the leading dot). Folder names are never split on a dot.
 * @param {string} filePath
 * @param {boolean} isFolder
 * @returns {{root: string, extension: string}}
 */
function splitName(filePath, isFolder) {
  if (isFolder) {
    // Folder hash values must not include leading or trailing slashes.
    const root = filePath.replace(/^\\+/, '').replace(/\\+$/, '');

    return { root, extension: '' };
  }

  // File records hash the file name only, so drop the directory part first
  // (this also avoids mistaking a dotted folder like `skyrim.esm` for an
  // extension).
  const fileName = filePath.slice(filePath.lastIndexOf('\\') + 1);
  const lastDot = fileName.lastIndexOf('.');

  if (lastDot === -1) {
    return { root: fileName, extension: '' };
  }

  return {
    root: fileName.slice(0, lastDot),
    extension: fileName.slice(lastDot),
  };
}

/**
 * Core hash routine. Operates on already normalized, split names.
 * @param {string} root
 * @param {string} extension
 * @returns {bigint}
 */
function hashParts(root, extension) {
  const length = Math.min(root.length, MAX_NAME_LENGTH);
  const chars = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    chars[i] = root.codePointAt(i) & 0xff;
  }

  // Low 32 bits: length + first two / last characters + extension flag.
  let hash1 = 0;

  if (length > 0) {
    hash1 = chars[length - 1];
    hash1 |= length > 2 ? chars[length - 2] << 8 : 0;
    hash1 |= length << 16;
    hash1 |= chars[0] << 24;
  }

  switch (extension) {
    case '.kf': {
      hash1 |= 0x80;
      break;
    }

    case '.nif': {
      hash1 |= 0x80_00;
      break;
    }

    case '.dds': {
      hash1 |= 0x80_80;
      break;
    }

    case '.wav': {
      hash1 |= 0x80_00_00_00;
      break;
    }

    default: {
      break;
    }
  }

  hash1 >>>= 0;

  // High 32 bits: polynomial over the name middle plus polynomial over the
  // extension (computed separately and summed).
  let middle = 0;

  for (let i = 1; i < length - 2; i++) {
    middle = (Math.imul(middle, POLY) + chars[i]) >>> 0;
  }

  let extensionHash = 0;

  for (let i = 0; i < extension.length; i++) {
    const code = extension.codePointAt(i) & 0xff;
    extensionHash = (Math.imul(extensionHash, POLY) + code) >>> 0;
  }

  const hash2 = (middle + extensionHash) >>> 0;

  return (BigInt(hash2) << 32n) | BigInt(hash1);
}

/**
 * Calculate the 64-bit Bethesda hash of a file or folder name.
 * @param {string} filePath File name (a path is accepted, only the file name is
 *   hashed) or folder path when `isFolder` is `true`.
 * @param {boolean} [isFolder=false] Hash as a folder record.
 * @returns {bigint}
 */
function calculateBethesdaHash(filePath, isFolder = false) {
  if (typeof filePath !== 'string') {
    throw new TypeError('Argument 1 must be a string');
  }

  const normalized = normalize(filePath);
  const { root, extension } = splitName(normalized, isFolder);

  return hashParts(root, extension);
}

/**
 * Calculate a file record hash. The directory part is ignored.
 * @param {string} filePath
 * @returns {bigint}
 */
export function createFileHash(filePath) {
  return calculateBethesdaHash(filePath, false);
}

/**
 * Calculate a folder record hash.
 * @param {string} folderPath
 * @returns {bigint}
 */
export function createFolderHash(folderPath) {
  return calculateBethesdaHash(folderPath, true);
}

/**
 * Calculate file hash.
 * @param {string} filePath
 * @returns {bigint}
 */
export default function createHash(filePath) {
  return createFileHash(filePath);
}
