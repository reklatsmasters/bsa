'use strict'

/* bitwise ops */

const bits = [
  0x1,  /* 1 */
  0x2,  /* 2 */
  0x4,  /* 3 */
  0x8,  /* 4 */
  0x10, /* 5 */
  0x20, /* 6 */
  0x40, /* 7 */
  0x80  /* 8 */
]

/**
 * read bit from number
 * @param num {number}
 * @param bit {number} bit, [1 - 32]
 */
exports.get = function bitwise_get (num, bit) {
  if (typeof num !== 'number') {
    throw new TypeError('Argument 1 must be a number')
  }

  if (bit > 32 || bit < 1) {
    throw new RangeError('Only 32-bit values supported')
  }

  if (bit <= 8) {           /* 1st byte */
    return check_bit(num, bit)
  } else if (bit <= 16) {   /* 2nd byte */
    return check_bit(num >> 8, bit - 8)
  } else if (bit <= 24) {
    return check_bit(num >> 16, bit - 16)
  } else {
    return check_bit(num >> 24, bit - 24)
  }
}

function check_bit(byte, bit) {
  return byte & bits[bit - 1]
}
