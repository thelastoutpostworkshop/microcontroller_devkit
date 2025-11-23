export type FileSource = string | ArrayBuffer | Uint8Array;
type BinarySource = ArrayBuffer | Uint8Array;
export interface LittleFSEntry {
    path: string;
    size: number;
}
export interface LittleFSOptions {
    blockSize?: number;
    blockCount?: number;
    lookaheadSize?: number;
    /**
     * Optional override for the wasm asset location. Useful when bundlers move files.
     */
    wasmURL?: string | URL;
    /**
     * Formats the filesystem immediately after initialization.
     */
    formatOnInit?: boolean;
}
export interface LittleFS {
    format(): void;
    list(): LittleFSEntry[];
    addFile(path: string, data: FileSource): void;
    deleteFile(path: string): void;
    toImage(): Uint8Array;
    readFile(path: string): Uint8Array;
}
export declare class LittleFSError extends Error {
    readonly code: number;
    constructor(message: string, code: number);
}
export declare function createLittleFS(options?: LittleFSOptions): Promise<LittleFS>;
export declare function createLittleFSFromImage(image: BinarySource, options?: LittleFSOptions): Promise<LittleFS>;
export {};
