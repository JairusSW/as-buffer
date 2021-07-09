const hexLookupTable: StaticArray<string> = ['00','01','02','03','04','05','06','07','08','09','0a','0b','0c','0d','0e','0f','10','11','12','13','14','15','16','17','18','19','1a','1b','1c','1d','1e','1f','20','21','22','23','24','25','26','27','28','29','2a','2b','2c','2d','2e','2f','30','31','32','33','34','35','36','37','38','39','3a','3b','3c','3d','3e','3f','40','41','42','43','44','45','46','47','48','49','4a','4b','4c','4d','4e','4f','50','51','52','53','54','55','56','57','58','59','5a','5b','5c','5d','5e','5f','60','61','62','63','64','65','66','67','68','69','6a','6b','6c','6d','6e','6f','70','71','72','73','74','75','76','77','78','79','7a','7b','7c','7d','7e','7f','80','81','82','83','84','85','86','87','88','89','8a','8b','8c','8d','8e','8f','90','91','92','93','94','95','96','97','98','99','9a','9b','9c','9d','9e','9f','a0','a1','a2','a3','a4','a5','a6','a7','a8','a9','aa','ab','ac','ad','ae','af','b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','ba','bb','bc','bd','be','bf','c0','c1','c2','c3','c4','c5','c6','c7','c8','c9','ca','cb','cc','cd','ce','cf','d0','d1','d2','d3','d4','d5','d6','d7','d8','d9','da','db','dc','dd','de','df','e0','e1','e2','e3','e4','e5','e6','e7','e8','e9','ea','eb','ec','ed','ee','ef','f0','f1','f2','f3','f4','f5','f6','f7','f8','f9','fa','fb','fc','fd','fe','ff']

export class JSONbuffer {
  public type: string = "Buffer";
  constructor(public data: Uint8Array) {}
}

/**
 * AssemblyScript Buffer
 */
export class Buffer extends Uint8Array {
  /**
   * Allocates a new buffer containing the given {str}.
   *
   * @param str String to store in buffer.
   * @param encoding encoding to use, optional.  Default is 'utf8'
   * @deprecated
   */
  public constructor(str: string, encoding: string | null = null) {
    let data: Uint8Array = new Uint8Array(0);
    if (encoding) {
      if (encoding === "binary" || encoding === "latin1") {
        data = decodeLatin(str);
      } else if (encoding === "hex") {
        data = decodeHEX(str);
      } else if (encoding === "utf8" || encoding === "utf-8") {
        data = Uint8Array.wrap(String.UTF8.encode(str));
      } else if (
        encoding === "ucs2" ||
        encoding === "ucs-2" ||
        encoding === "utf16le" ||
        encoding === "utf-16le"
      ) {
        data = Uint8Array.wrap(String.UTF16.encode(str));
      } else if (encoding === "base64") {
        data = decodeBase64(str);
      } else if (encoding === "ascii") {
        data = decodeAscii(str)
      }
    }

    // UTF8 as default encoding
    if (!encoding) data = Uint8Array.wrap(String.UTF8.encode(str));

    super(data.length);

    cloneData(data, this);

  }
  /**
   * Convert buffer to string. Can be encoded with the provided encoding.
   * @param encoding string | null
   * @returns string
   */
  toString(encoding: string | null = null): string {
    if (!encoding) return String.UTF8.decode(this.buffer);

    if (encoding === "binary" || encoding === "latin1") {
      return encodeLatin(this);
    } else if (encoding === "hex") {
      return encodeHEX(this);
    } else if (encoding === "utf8" || encoding === "utf-8") {
      return String.UTF8.decode(this.buffer);
    } else if (
      encoding === "ucs2" ||
      encoding === "ucs-2" ||
      encoding === "utf16le" ||
      encoding === "utf-16le"
    ) {
      return String.UTF16.decode(this.buffer);
    } else if (encoding === "base64") {
      return encodeBase64(this);
    } else if (encoding === "ascii") {
      return encodeAscii(this)
    }
    return "";
  }
  equals(otherBuffer: Buffer): boolean {
    let equals = true;
    if (this.length !== otherBuffer.length) return false;
    if (this.byteLength !== otherBuffer.length) return false;
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== otherBuffer[i]) return false;
    }
    return equals;
  }
  toJSON(): JSONbuffer {
    return new JSONbuffer(bufferToUintArray(this));
  }
  slice(start: i32, end: i32): Buffer {
    let startNum = 0;
    let endNum = this.length;
    if (start) startNum = start;
    if (end) endNum = end;
    const buf = Uint8Array.wrap(this.buffer);
    return changetype<Buffer>(buf.slice(startNum, endNum));
  }
  write(str: string): Buffer {
    const buf = new Uint8Array(this.length + str.length);
    const strBytes = Uint8Array.wrap(String.UTF8.encode(str));
    for (let i = 0; i < this.length; i++) {
      buf[i] = this[i];
    }
    for (let u = this.length; u < this.length + str.length; u++) {
      buf[u] = strBytes[u];
    }
    return changetype<Buffer>(buf);
  }
  /**
   * Allocates a new buffer of {size} octets.
   *
   * @param size count of octets to allocate.
   * @param fill if specified, buffer will be initialized by calling buf.fill(fill).
   *    If parameter is omitted, buffer will be filled with zeros.
   * @param encoding encoding used for call to buf.fill while initializing
   */
  static alloc /*<T>*/(
    size: i32 /*, fill: T | null = null, encoding: string | null*/
  ): Buffer {
    return changetype<Buffer>(new Uint8Array(size));
  }
  /**
   * Allocates a new buffer of {size} octets, leaving memory not initialized, so the contents
   * of the newly created Buffer are unknown and may contain sensitive data.
   *
   * @param size count of octets to allocate
   */
  static allocUnsafe(size: i32): Buffer {
    // Temporary until I learn memory
    return Buffer.alloc(size);
    /*
    // range must be valid
    if (<usize>size > BLOCK_MAXSIZE) throw new RangeError(E_INVALIDLENGTH);
    let buffer = heap.alloc(size);
    let result = heap.alloc(offsetof<Buffer>());

    // set the properties
    store<usize>(result, buffer, offsetof<Buffer>("buffer"));
    store<usize>(result, buffer, offsetof<Buffer>("dataStart"));
    store<i32>(result, size, offsetof<Buffer>("byteLength"));

    // return and retain
    return changetype<Buffer>(result);
    */
  }
  /**
   * Allocates a new non-pooled buffer of {size} octets, leaving memory not initialized, so the contents
   * of the newly created Buffer are unknown and may contain sensitive data.
   *
   * @param size count of octets to allocate
   */
  static allocUnsafeSlow(size: i32): Buffer {
    // Temporary until I learn memory
    return Buffer.alloc(size);
    /*
    // range must be valid
    if (<usize>size > BLOCK_MAXSIZE) throw new RangeError(E_INVALIDLENGTH);
    let buffer = heap.alloc(size);
    let result = heap.alloc(offsetof<Buffer>());

    // set the properties
    store<usize>(result, buffer, offsetof<Buffer>("buffer"));
    store<usize>(result, buffer, offsetof<Buffer>("dataStart"));
    store<i32>(result, size, offsetof<Buffer>("byteLength"));

    // return and retain
    return changetype<Buffer>(result);
    */
  }
  /**
   * Create buffer from multiple types.
   * @param data string | Buffer | Uint8Array | Array | ArrayBuffer
   * @param encoding string | null
   * @returns Buffer
   */
  static from<T>(data: T, encoding: string | null = null): Buffer {
    if (typeof data === "string") {
      return new Buffer(changetype<string>(data), encoding);
    } else if (data instanceof Buffer || data instanceof Uint8Array) {
      return changetype<Buffer>(data);
    } else if (data instanceof ArrayBuffer) {
      return changetype<Buffer>(Uint8Array.wrap(data));
    } else if (isArray(data)) {
      if (data.length === 0) return Buffer.alloc(0);
      if (typeof data[0] === "number") {
        const buf = Buffer.alloc(data.length);
        for (let i = 0; i < data.length; i++) {
          buf[i] = u8(data[i]);
        }
        return buf;
      }
      throw new Error("Invalid Data Provided.");
    } else {
      throw new Error("Invalid Data Provided.");
    }
  }
  /**
   * Returns true if {encoding} is a valid encoding argument.
   * Valid string encodings in Node 0.12: 'ascii'|'utf8'|'utf16le'|'ucs2'(alias of 'utf16le')|'base64'|'binary'(deprecated)|'hex'
   *
   * @param encoding string to test.
   */
  static isBuffer<T>(obj: T): boolean {
    return obj instanceof Buffer;
  }
  /**
   * Check if the provided encoding is valid.
   * @param encoding string
   * @returns boolean
   */
  static isEncoding(encoding: string): boolean {
    const encodings = ["utf8", "utf-8", "latin1", "binary", "hex", "base64", "ascii", "utf16le", "ucs2", "ucs-2", "utf-16le"];
    return encodings.includes(encoding) ? true : false;
  }
  /**
   * Gives the actual byte length of a string. encoding defaults to 'utf8'.
   * This is not the same as String.prototype.length since that returns the number of characters in a string.
   *
   * @param string string to test.
   * @param encoding encoding used to evaluate (defaults to 'utf8')
   */
  static byteLength(string: string, encoding: string | null = null): i32 {
    if (!encoding) return string.length;
    if (encoding === "binary" || encoding === "latin1") {
      return string.length;
    } else if (encoding === "hex") {
      return string.length >>> 1;
    } else {
      return string.length;
    }
  }
  /**
   * Returns a buffer which is the result of concatenating all the buffers in the list together.
   *
   * If the list has no items, or if the totalLength is 0, then it returns a zero-length buffer.
   * If the list has exactly one item, then the first item of the list is returned.
   * If the list has more than one item, then a new Buffer is created.
   *
   * @param list An array of Buffer objects to concatenate
   * @param totalLength Total length of the buffers when concatenated.
   *   If totalLength is not provided, it is read from the buffers in the list. However, this adds an additional loop to the function, so it is faster to provide the length explicitly.
   */
  static concat(list: Buffer[]): Buffer {
    const arr = new Array<u8>();
    for (let i = 0; i < list.length; i++) {
      for (let u = 0; u < list[i].length; u++) {
        arr.push(list[i][u]);
      }
    }
    return Buffer.from(arr);
  }
  // TODO
  /**
   * The same as buf1.compare(buf2).
   */
  static compare(): void {}
}

function cloneData(from: Uint8Array, to: Uint8Array): void {
  for (let i = 0; i < from.length; i++) {
    to[i] = from[i];
  }
}

function bufferToArray(buffer: Buffer): Array<u8> {
  const arr = new Array<u8>(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    arr[i] = buffer[i];
  }
  return arr;
}

function bufferToUintArray(buffer: Buffer): Uint8Array {
  const arr = new Uint8Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    arr[i] = buffer[i];
  }
  return arr;
}


function encodeLatin(buf: Uint8Array): string {
  let ret = ''
  for (let i = 0; i < buf.length; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function decodeLatin(str: string): Uint8Array {
  const byteArray = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    byteArray[i] = str.charCodeAt(i);
  }
  return byteArray;
}

function encodeHEX(buf: Uint8Array): string {
  let out = ''
  for (let i = 0; i < buf.byteLength; ++i) {
    out += hexLookupTable[buf[i]];
  }
  return out
}

function decodeHEX(str: string): Uint8Array {
  const byteArray = new Uint8Array(str.length >>> 1);
  const strArray = str.split("");
  let pos = 0;
  for (let i = 0; i < str.length / 2; ++i) {
    let hex = "" + strArray[pos] + "" + strArray[pos + 1] + "";
    byteArray[i] = u32(parseInt("0x" + hex + "", 16));
    pos = pos + 2;
  }
  return byteArray;
}

function decodeAscii(str: string): Uint8Array {
  const byteArray = new Uint8Array(str.length)
  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray[i] = (str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function encodeAscii (buf: Uint8Array): string {
  let ret = ''
  for (let i = 0; i < buf.length; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

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