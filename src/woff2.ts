// @ts-ignore
import * as ModuleFactory from '../dist/ffi.js';

// TODO: More error handling?


export class Woff2 {
  private mod: any;

  constructor(mod: any) {
    console.log('Woff2 constructor called');
    if (typeof mod._malloc !== 'function') {
      throw new Error('WASM module not properly initialized: _malloc is not a function');
    }
    this.mod = mod;
    console.log('Woff2 constructor completed');
  }

  compress(data: Uint8Array): Uint8Array {
    const inSize = data.byteLength;
    const inOffset = this.mod._malloc(inSize);
    this.mod.HEAPU8.set(data, inOffset);
    // const inputPtr = mod._malloc(inputSize);
    // mod.HEAPU8.set(data, inputPtr);
    // this.mod.HEAPU8.set(data, inOffset);

    const maxOutSize = this.mod.ccall(
      'get_max_compressed_size',
      'number',
      ['number, number'],
      [inOffset, inSize]
    );

    const output = new Uint8Array(maxOutSize);
    const outOffset = this.mod._malloc(maxOutSize);
    this.mod.HEAPU8.set(output, outOffset);
    const outSize = this.mod.ccall(
      'ttf_to_woff2',
      'number',
      ['number', 'number', 'number', 'number'],
      [inOffset, inSize, outOffset, maxOutSize]
    );

    if (outSize === 0) {
      throw new Error('woff2: Failed to compress');
    }
    const res = this.mod.HEAPU8.subarray(outOffset, outOffset + outSize).slice(0);

    this.mod._free(inOffset);
    this.mod._free(outOffset);
    return res;
  }

  uncompress(data: Uint8Array): Uint8Array {
    console.log('WOFF2 uncompress called, input length:', data.length);
    const inSize = data.byteLength;
    const inOffset = this.mod._malloc(inSize);
    this.mod.HEAPU8.set(data, inOffset);
  
    console.log('Calculating uncompressed size...');
    const uncompressSize = this.mod.ccall(
      'get_uncompressed_size',
      'number',
      ['number', 'number'],
      [inOffset, inSize]
    );
    console.log('Uncompressed size:', uncompressSize);
  
    if (uncompressSize === 0) {
      console.error('Failed to calculate uncompressed size');
      throw new Error('woff2: Failed to calculate uncompressed size');
    }
  
    const output = new Uint8Array(uncompressSize);
    const outOffset = this.mod._malloc(uncompressSize);
    this.mod.HEAPU8.set(output, outOffset);
  
    console.log('Decompressing WOFF2...');
    const outSize = this.mod.ccall(
      'woff2_to_ttf',
      'number',
      ['number', 'number', 'number', 'number'],
      [outOffset, uncompressSize, inOffset, inSize]
    );
    console.log('Decompression result size:', outSize);
  
    if (outSize === 0) {
      console.error('Failed to decompress WOFF2');
      throw new Error('woff2: Failed to uncompress');
    }
  
    const res = this.mod.HEAPU8.subarray(outOffset, outOffset + outSize).slice(0);
  
    this.mod._free(inOffset);
    this.mod._free(outOffset);
  
    console.log('WOFF2 uncompressed successfully, result length:', res.length);
    return res;
  }
}

declare const createModule: any;

export function createWoff2(wasmBinary: Uint8Array, createModuleFunc: any): Promise<Woff2> {
  console.log('createWoff2 called with wasmBinary length:', wasmBinary.length);
  return new Promise<Woff2>((resolve, reject) => {
    createModuleFunc({
      wasmBinary: wasmBinary,
      onRuntimeInitialized: () => {
        console.log('WASM runtime initialized');
      }
    }).then((mod: any) => {
      console.log('Module created successfully');
      if (typeof mod._malloc !== 'function') {
        console.error('_malloc is not a function after initialization');
        reject(new Error('WASM module not properly initialized'));
      } else {
        console.log('_malloc is available');
        resolve(new Woff2(mod));
      }
    }).catch((error: any) => {
      console.error('Error creating module:', error);
      reject(error);
    });
  });
}