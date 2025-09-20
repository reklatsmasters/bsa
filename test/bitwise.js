import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getBit, setBit } from '../src/bitwise.js';

describe('should get bit', () => {
  it('from int8', () => {
    const number_ = 0b100;

    assert.equal(getBit(number_, 1), false);
    assert.equal(getBit(number_, 3), true);
  });

  it('from int16', () => {
    const number_ = Buffer.from([0b10, 0b1000_1001]).readUInt16BE();

    assert.equal(getBit(number_, 9), false);
    assert.equal(getBit(number_, 10), true);
  });

  it('from int32', () => {
    const number_ = Buffer.from([
      0b1_0010, 0b10_0011, 0b10, 0b1000_1001,
    ]).readUInt32BE();

    assert.equal(getBit(number_, 17), true);
    assert.equal(getBit(number_, 19), false);

    assert.equal(getBit(number_, 25), false);
    assert.equal(getBit(number_, 26), true);
  });
});

describe('should set bit', () => {
  it('in int8', () => {
    const byte = 0b100;

    assert.equal(setBit(byte, 1), 0b101);
    assert.equal(setBit(byte, 2), 0b110);
    assert.equal(setBit(byte, 3), 0b100);
  });

  it('in int16', () => {
    const byte = 0b10_1000_1001;

    assert.equal(setBit(byte, 9), 0b11_1000_1001);
    assert.equal(setBit(byte, 10), 0b10_1000_1001);
  });
});
