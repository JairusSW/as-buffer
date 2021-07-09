# ![AS](https://avatars1.githubusercontent.com/u/28916798?s=40) AS-Buffer
**Buffer implementation for AssemblyScript**

## Installation
```bash
~ npm install buffer-as
```

## Usage

```js
import { Buffer } from 'buffer-as'

const buf = Buffer.from('Hello World!')

console.log(buf.toString('utf8'))
// 'Hello World!'
```

## API

**Buffer.from<T>(data: T, encoding: string | null)**
Create a new buffer from multiple data types.

**Buffer.write(str: string): Buffer**
Write string data to the buffer.

**Buffer.slice(start: i32, end: i32): Buffer**
Slices the buffer into a chunk.

**Buffer.alloc(size: i32): Buffer**
Allocate an empty buffer with a defined size.

**Buffer.allocUnsafe(size: i32): Buffer**
Allocate an empty buffer with a defined size. Unsafe.

**Buffer.allocUnsafeSlow(size: i32): Buffer**
Allocate an empty buffer with a defined size. Unsafe.

**Buffer.isBuffer<T>(obj: T): boolean**
Check if a object is of type buffer.

**Buffer.toString(encoding: string | null): string**
Convert a buffer to a string.

**Buffer.toJSON(): JSONbuffer**
Convert a buffer to a JSON object.

**Buffer.equals(otherBuffer: Buffer): boolean**
Check if this buffer equals another buffer.

**Buffer.isEncoding(encoding: string): boolean**
Check if the provided encoding is valid.

**Buffer.concat(list: Buffer[]): Buffer**
Join a list of buffers into a single buffer.

**Buffer.byteLength(string: string, encoding?: string): i32**
Get the byte length of a string.
