/* eslint-disable no-bitwise */
const bits = [
  0x1 /* 1 */, 0x2 /* 2 */, 0x4 /* 3 */, 0x8 /* 4 */, 0x10 /* 5 */,
  0x20 /* 6 */, 0x40 /* 7 */, 0x80 /* 8 */,
];

/**
 *  1 2 3 4 5 6 7 8
 *  0 0 0 0 0 0 0 1 // 1
 *  0 0 0 0 0 0 1 0 // 2
 *  0 0 0 0 0 1 0 0 // 4
 *  0 0 0 0 1 0 0 0 // 8
 *  0 0 0 1 0 0 0 0 // 16
 *  0 0 1 0 0 0 0 0 // 32
 *  0 1 0 0 0 0 0 0 // 64
 *  1 0 0 0 0 0 0 0 // 128
 */

/**
 * Read bit from number
 * @param num {number}
 * @param bit {number} bit, [1 - 32]
 * @returns {boolean}
 */
export function getBit(number_, bit) {
  if (typeof number_ !== 'number') {
    throw new TypeError('Argument 1 must be a number');
  }

  if (typeof bit !== 'number') {
    throw new TypeError('Argument 2 must be a number');
  }

  if (bit > 32 || bit < 1) {
    throw new RangeError('Only 32-bit values are supported');
  }

  return Boolean(_getBit(number_, bit));
}

/**
 * Read bit from number
 * @private
 * @param num {number}
 * @param bit {number} bit, [1 - 32]
 * @returns {number}
 */
function _getBit(number_, bit) {
  if (bit <= 8) {
    /* 1st byte */
    return checkBit(number_, bit);
  }

  if (bit <= 16) {
    /* 2nd byte */
    return checkBit(number_ >> 8, bit - 8);
  }

  if (bit <= 24) {
    return checkBit(number_ >> 16, bit - 16);
  }

  return checkBit(number_ >> 24, bit - 24);
}

/**
 * Set bit in provided number.
 * @param {number} number
 * @param {number} bit
 * @returns {number}
 */
export function setBit(number, bit) {
  if (typeof number !== 'number') {
    throw new TypeError('Argument 1 must be a number');
  }

  if (typeof bit !== 'number') {
    throw new TypeError('Argument 2 must be a number');
  }

  if (bit > 32 || bit < 1) {
    throw new RangeError('Only 32-bit values are supported');
  }

  if (bit <= 8) {
    /* 1st byte */
    return _setBit(number, bit);
  }

  if (bit <= 16) {
    /* 2nd byte */
    return _setBit(number, bit - 8, 8);
  }

  if (bit <= 24) {
    return _setBit(number, bit - 16, 16);
  }

  return _setBit(number, bit - 24, 24);
}

function checkBit(byte, bit) {
  return byte & bits[bit - 1];
}

/**
 * Set bit in byte.
 * @param {number} byte
 * @param {number} bit
 * @returns {number}
 */
function _setBit(byte, bit, shift = 0) {
  return byte | (bits[bit - 1] << shift);
}
