import { BLOCK_MAXSIZE } from "rt/common";
import { E_INVALIDLENGTH } from "util/error";

// @ts-ignore
import { StringSink } from "as-string-sink";
import { decodeHEX, decodeLatin, encodeHEX } from "./encodings";

class JSONbuffer {
  public type: string = "Buffer";
  constructor(public data: u8[]) {}
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
    let length = str.length;
    if (encoding) {
      if (
        encoding === "utf8" ||
        encoding === "utf-8" ||
        encoding === "binary" ||
        encoding === "latin1"
      )
        length = str.length;
      else if (encoding === "hex") length === str.length >>> 1;
    }
    super(length);
    if (!encoding) cloneData(Uint8Array.wrap(String.UTF8.encode(str)), this);
    if (encoding === "utf8" || encoding === "utf-8") {
      cloneData(Uint8Array.wrap(String.UTF8.encode(str)), this);
    } else if (encoding === "hex") {
      cloneData(decodeHEX(str), this);
    } else if (encoding === "latin1" || encoding === "binary") {
      cloneData(decodeLatin(str), this);
    }
  }
  /**
   * Convert buffer to string. Can be encoded with the provided encoding.
   * @param encoding string | null
   * @returns string
   */
  toString(encoding: string | null = null): string {
    if (!encoding) return String.UTF8.decode(this.buffer);
    if (encoding === "utf-8" || encoding === "utf8")
      return String.UTF8.decode(this.buffer);
    else if (encoding === "hex") return encodeHEX(this);
    else return "";
  }
  equals(otherBuffer: Buffer): boolean {
    let equals = true
    if (this.length !== otherBuffer.length) return false
    if (this.byteLength !== otherBuffer.length) return false
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== otherBuffer[i]) return false   
    }
    return equals
  }
  toJSON(): JSONbuffer {
    return new JSONbuffer(bufferToArray(this));
  }
  slice(start: i32 | null = null, end: i32 | null = null): Buffer {
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
  }
  /**
   * Allocates a new non-pooled buffer of {size} octets, leaving memory not initialized, so the contents
   * of the newly created Buffer are unknown and may contain sensitive data.
   *
   * @param size count of octets to allocate
   */
  static allocUnsafeSlow(size: i32): Buffer {
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
    const encodings = ["utf8", "utf-8", "latin1", "binary", "hex"];
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
