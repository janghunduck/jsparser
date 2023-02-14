// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

const lineBreak = /\r\n?|\n|\u2028|\u2029/
const lineBreakG = new RegExp(lineBreak.source, "g")

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

function nextLineBreak(code, from, end = code.length) {
  for (let i = from; i < end; i++) {
    let next = code.charCodeAt(i)
    if (isNewLine(next))
      return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1
  }
  return -1
}

const nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/

const skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g
