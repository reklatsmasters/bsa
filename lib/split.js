module.exports = split

/**
 * split buffer by delimitter
 */
function split(buf, by) {
  const bufs = []
  let len = buf.length
  let i = 0

  while(len) {
    if (buf[i] == by) {
      if (i > 0) {
        bufs.push(buf.slice(0, i))
        buf = buf.slice(i + 1)
      }

      i = -1  /* reset to 0 for next tick */
    }

    ++i
    --len
  }


  if (i) {
    bufs.push(buf)
  }

  return bufs
}
