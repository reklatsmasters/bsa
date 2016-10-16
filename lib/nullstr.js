module.exports = nullstr

/**
 * read buffer until \0 byte
 * @param buf {Buffer}
 */
function nullstr(buf) {
  for(var i = 0; i < buf.length; ++i) {
    if (buf[i] == 0) {
      return buf.slice(0, i)
    }
  }

  return buf
}
