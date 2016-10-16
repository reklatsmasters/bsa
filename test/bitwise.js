import test from 'ava'
const bitwise = require('../lib/bitwise')

test(t => {
  const num = 0b100

  t.is(bitwise.get(num, 1), 0)
  t.is(bitwise.get(num, 3), 0b100)
})

test(t => {
  const num = Buffer.from([ 0b10, 0b10001001 ]).readUInt16BE()

  t.is(bitwise.get(num, 9), 0)
  t.is(bitwise.get(num, 10), 0b10)
})

test(t => {
  const num = Buffer.from([ 0b10010, 0b100011, 0b10, 0b10001001 ]).readUInt32BE()

  t.is(bitwise.get(num, 17), 0b1)
  t.is(bitwise.get(num, 19), 0)

  t.is(bitwise.get(num, 25), 0)
  t.is(bitwise.get(num, 26), 0b10)
})
