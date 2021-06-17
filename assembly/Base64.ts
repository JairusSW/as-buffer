let lookup: Array<string> = []
let revLookup: Array<u32> = []
let code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (let i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code.charAt(i)
  revLookup[code.charCodeAt(i)] = i
}
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64: string): Uint8Array {
  let len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }
  let validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len
  let placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  const uin8 = new Uint8Array(2)
  uin8[0] = validLen
  uin8[1] = placeHoldersLen

  return uin8
}

export function decodeBase64 (b64: string): Uint8Array {
  let tmp: u32
  let lens = getLens(b64)
  let validLen = lens[0]
  let placeHoldersLen = lens[1]
  let arr = new Uint8Array(((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen)
  let curByte = 0
  let len = placeHoldersLen > 0
    ? validLen - 4
    : validLen
  let i: u32
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }
  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }
  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }
  return arr
}

function tripletToBase64 (num: u32): string {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8: Uint8Array, start: u32, end: number): string {
  let tmp: u32
  let output: Array<string> = []
  for (let i: u32 = start; i < end; i += 3) {
    tmp =
      ((u32(uint8[i]) << 16) & 0xFF0000) +
      ((u32(uint8[i + 1]) << 8) & 0xFF00) +
      (u32(uint8[i + 2]) & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

export function encodeBase64 (uint8: Uint8Array): string {
  let tmp: u32
  let len = uint8.length
  let extraBytes = len % 3
  let parts: Array<string> = []
  let maxChunkLength = 16383
  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }
  return parts.join('')
}