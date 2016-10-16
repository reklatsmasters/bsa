import test from 'ava'
const nullstr = require('../lib/nullstr')

test(t => {
  const buf = nullstr(Buffer.from('1A2A3A001B2B', 'hex'))

  t.is(buf.toString('hex'), '1a2a3a')
})
