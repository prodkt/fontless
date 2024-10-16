import { Format, getFontFormat, isValidFormat } from './format';
import { Converter } from './convert';
import { Woff2, createWoff2 } from './woff2';
import * as ModuleFactory from '../dist/ffi.js';


// async function loadWoff2Wasm(): Promise<Woff2> {
//   console.log('Starting to load WASM');
//   try {
//     const response = await fetch('ffi.wasm');
//     console.log('WASM fetched, status:', response.status);
//     const buffer = await response.arrayBuffer();
//     console.log('WASM buffer received, length:', buffer.byteLength);
//     const wasmBinary = new Uint8Array(buffer);
//     console.log('Creating WOFF2...');
//     const woff2 = await createWoff2(wasmBinary);
//     console.log('WOFF2 object created:', woff2);
//     return woff2;
//   } catch (error) {
//     console.error('Error in loadWoff2Wasm:', error);
//     throw error;
//   }
// }

async function loadWoff2Wasm(): Promise<Woff2> {
  console.log('Starting to load WASM');
  try {
    const wasmResponse = await fetch('ffi.wasm');
    const wasmBuffer = await wasmResponse.arrayBuffer();
    const wasmBinary = new Uint8Array(wasmBuffer);

    const jsResponse = await fetch('ffi.js');
    if (!jsResponse.ok) {
      throw new Error(`Failed to fetch ffi.js: ${jsResponse.status} ${jsResponse.statusText}`);
    }
    const jsText = await jsResponse.text();
    
    // Evaluate the ffi.js content
    const createModuleFunc = new Function(jsText + '\nreturn createModule;')();
    if (typeof createModuleFunc !== 'function') {
      throw new Error('createModule is not a function after evaluation');
    }
    
    console.log('Creating WOFF2...');
    const woff2 = await createWoff2(wasmBinary, createModuleFunc);
    console.log('WOFF2 object created:', woff2);
    return woff2;
  } catch (error) {
    console.error('Error in loadWoff2Wasm:', error);
    throw error;
  }
}


async function convert(converter: Converter, data: Uint8Array, format: Format): Promise<Uint8Array> {
  console.log('Converting to format:', format);
  console.log('Input data length:', data.length);
  const inputFormat = getFontFormat(data);
  console.log('Input format:', inputFormat);
  try {
    let result: Uint8Array;
    if (format === Format.OTF) {
      console.log('Attempting to convert to OTF');
      result = converter.toOtf(data);
    } else if (format === Format.WOFF) {
      console.log('Attempting to convert to WOFF');
      result = converter.toWoff(data);
    } else if (format === Format.WOFF2) {
      console.log('Attempting to convert to WOFF2');
      result = converter.toWoff2(data);
    } else {
      throw new Error('Unsupported output format');
    }
    console.log('Conversion successful, output length:', result.length);
    return result;
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

let converter: Converter | null = null;

async function handleMessage(messageId: number, e: MessageEvent) {
  console.log('Handling message in worker:', e.data);
  if (!converter) {
    console.error('Worker not initialized');
    throw new Error('Worker not initialized');
  }

  const action = e.data.action;
  if (action === 'convert') {
    const format = e.data.format;
    if (!isValidFormat(format)) {
      throw new Error(`Invalid output font format: ${format}`);
    }
    const input = e.data.input;
    const inputFormat = getFontFormat(input);
    if (inputFormat === Format.UNSUPPORTED) {
      throw new Error(`Unsupported font`);
    }
    const output = await convert(converter, input, format);
    const response = {
      output: output
    };
    // TODO: Figure out why transferring doesn't work other than Chrome.
    // Transferring doesn't work only when converting to woff2, so emscripten's
    // memory system may be related.
    // @ts-ignore: self is DedicatedWorkerGlobalScope
    self.postMessage({ messageId: messageId, response: response });
  }
}

self.addEventListener('message', async e => {
  console.log('Worker received message:', e.data);
  if (e.data === 'init') {
    console.log('Received init message');
    try {
      console.log('Starting initialization');
      console.log('Starting loadWoff2Wasm');
      const woff2 = await loadWoff2Wasm();
      console.log('loadWoff2Wasm completed successfully');
      converter = new Converter(woff2);
      console.log('Converter created successfully');
      // @ts-ignore: self is DedicatedWorkerGlobalScope
      self.postMessage('initialized');
    } catch (error) {
      console.error('Error during initialization:', error);
      // @ts-ignore: self is DedicatedWorkerGlobalScope
      self.postMessage({ name: 'error', message: 'Initialization failed: ' + error.message });
    }
    return;
  }

  const messageId = e.data.messageId;
  if (typeof messageId !== 'number') {
    // @ts-ignore: self is DedicatedWorkerGlobalScope
    self.postMessage({ error: 'Received a message without messageId' });
    return;
  }

  try {
    handleMessage(messageId, e);
  } catch (exception) {
    console.error(exception);
    // @ts-ignore: self is DedicatedWorkerGlobalScope
    self.postMessage({ messageId: messageId, error: exception.message });
  }
});

console.log('Worker script loaded');

self.addEventListener('error', (error) => {
  console.error('Worker error:', error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection in worker:', event.reason);
});

