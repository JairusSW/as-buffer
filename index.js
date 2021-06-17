const fs = require("fs");
const loader = require("@assemblyscript/loader");
const ConsoleImport = require('as-console/imports');
const { Blob } = require("buffer");
const Console = new ConsoleImport()
const imports = {
    ...Console.wasmImports
};
const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/build/untouched.wasm"), imports);
Console.wasmExports = wasmModule.exports
wasmModule.exports.test()
module.exports = wasmModule.exports;