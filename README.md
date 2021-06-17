# AS-Buffer
**Buffer implementation for AssemblyScript**

## Installation
```bash
~ npm install buffer-as
```

## Usage

```js
import { Buffer } fom 'buffer-as'

const buf = Buffer.from('Hello World!')

console.log(buf.toString('utf8'))
// 'Hello World!'
```

## API

**Buffer.from<T>(data: T, encoding: string | null)**
Create a new buffer from multiple data types.

**Buffer.alloc(size: i32): Buffer**
Allocate an empty buffer with a defined size.

**Buffer.allocUnsafe(size: i32): Buffer**
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
