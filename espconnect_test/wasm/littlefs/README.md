## littlefs-wasm

Tiny, dependency-free LittleFS bindings compiled with Emscripten for browsers. The generated module keeps data in a RAM-backed block device and exposes a friendly TypeScript API that works with modern bundlers (Vite, Rollup, Webpack, etc.) without Node/WASI shims.

### Features

- Uses upstream LittleFS sources vendored in `third_party/littlefs`.
- In-memory block device (configurable block size/count/lookahead).
- Mounts existing LittleFS images and exports them back to binary blobs.
- TypeScript-first API with zero runtime dependencies.
- Ships as a single ES module plus a `.wasm` asset (`import.meta.url` friendly).
- Minimal build pipeline (TypeScript + Emscripten) with simple scripts.

### Quick Start

```ts
import { createLittleFS } from "littlefs-wasm";

const fs = await createLittleFS({ formatOnInit: true });

fs.addFile("docs/readme.txt", "Hello LittleFS!");
fs.addFile("images/icon.bin", new Uint8Array([0xde, 0xad]));

console.log(fs.list());
// => [ { path: "docs/readme.txt", size: 16 }, { path: "images/icon.bin", size: 2 } ]

fs.deleteFile("images/icon.bin");
```

- `createLittleFS` loads and instantiates `littlefs.wasm`.
- The returned instance exposes synchronous `format`, `list`, `addFile`, and `deleteFile`.
- File paths are relative to the LittleFS root (no leading slash needed).

### API surface

```ts
export async function createLittleFS(options?: LittleFSOptions): Promise<LittleFS>;
export async function createLittleFSFromImage(image: ArrayBuffer | Uint8Array, options?: LittleFSOptions): Promise<LittleFS>;

interface LittleFS {
  format(): void;
  list(): Array<{ path: string; size: number }>;
  addFile(path: string, data: Uint8Array | ArrayBuffer | string): void;
  deleteFile(path: string): void;
  toImage(): Uint8Array;
  readFile(path: string): Uint8Array;
}

interface LittleFSOptions {
  blockSize?: number;      // default 512 bytes
  blockCount?: number;     // default 512 blocks (256 KiB)
  lookaheadSize?: number;  // default 32 bytes
  wasmURL?: string | URL;  // override asset resolution
  formatOnInit?: boolean;  // auto-format right after init
}
```

`list()` returns every file (including nested directories) produced by a depth-first walk. Entries include file paths (without a leading slash) and byte sizes. `createLittleFSFromImage` mounts an existing LittleFS disk image (byte array) without formatting, `toImage()` returns the current contents as a `Uint8Array` so you can save it back to disk, and `readFile()` returns raw file bytes for previews or editors.

### Building from source

Requirements:

- [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) (`emcc`) available in `PATH`.
- Node.js >= 18 for the TypeScript build pipeline.

Steps:

```bash
npm install
npm run build:wasm   # compiles C bindings + LittleFS into dist/littlefs.wasm
npm run build:types  # compiles src/ts -> dist (JS + .d.ts)
# or run both:
npm run build
```

The WASM build script (`scripts/build-wasm.mjs`) directly invokes `emcc` with `STANDALONE_WASM`, `ALLOW_MEMORY_GROWTH`, and a curated export list, so the produced module has no Node/WASI shims. The TypeScript build emits `dist/index.js` (ES2020) and declarations, ready to be consumed by bundlers as-is.

### File layout

```
src/
  |- c/littlefs_wasm.c      # Emscripten glue + RAM block device
  |- ts/index.ts            # Typed browser-facing API
third_party/littlefs        # Upstream LittleFS sources (git submodule/clone)
scripts/build-wasm.mjs      # Tiny emcc wrapper that writes dist/littlefs.wasm
dist/                       # Build artifacts (JS, d.ts, wasm)
```

### Notes

- The in-memory block device wipes to `0xFF` (like NOR flash) and can be reformatted via `fs.format()`.
- `createLittleFS` retries mounting after formatting by default; pass `formatOnInit: true` to force a clean slate.
- When bundling, ensure your tool copies/serves `dist/littlefs.wasm`. Using the default `new URL("./littlefs.wasm", import.meta.url)` pattern allows Vite/Rollup/Webpack to track the asset automatically.
- Error codes from LittleFS are surfaced through `LittleFSError` with the original numeric code for advanced handling.

### Licensing

- `littlefs-wasm`: MIT (see `LICENSE`).
- `third_party/littlefs`: retains its upstream license (see `third_party/littlefs/LICENSE.md`).
