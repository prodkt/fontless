import { Sfnt } from './sfnt';
import { Reader } from './reader';
import { OtfBuilder, OtfReader } from './otf';
import { WoffBuilder, WoffReader } from './woff';
import { Woff2 } from './woff2';
import { Format, getFontFormat } from './format';

interface FontReader {
  read(): Sfnt;
}

function createReader(dataReader: Reader, format: Format): FontReader {
  if (format === Format.OTF) {
    return new OtfReader(dataReader);
  } else if (format === Format.WOFF) {
    return new WoffReader(dataReader);
  }
  throw new Error(`Unsupported format: ${format}`);
}

export function readAsSfnt(data: Uint8Array): Sfnt {
  const format = getFontFormat(data);
  const reader = new Reader(data);
  const fontReader = createReader(reader, format);
  return fontReader.read();
}

export class Converter {
  private woff2: Woff2;

  constructor(woff2: Woff2) {
    console.log('Converter constructor called');
    if (!woff2 || typeof woff2 !== 'object') {
      console.error('Invalid woff2 object:', woff2);
      throw new Error('Invalid woff2 object');
    }
    this.woff2 = woff2;
    console.log('Converter constructor completed');
  }

  toOtf(data: Uint8Array): Uint8Array {
    console.log('toOtf called, input length:', data.length);
    const format = getFontFormat(data);
    console.log('Input format:', format);
    if (format === Format.OTF) {
      console.log('Input is already OTF, returning original data');
      return data;
    }
    if (format === Format.WOFF2) {
      console.log('Converting WOFF2 to OTF');
      const uncompressed = this.woff2.uncompress(data);
      console.log('WOFF2 uncompressed, length:', uncompressed.length);
      return uncompressed;
    }
    if (format === Format.WOFF) {
      console.log('Converting WOFF to OTF');
      const sfnt = readAsSfnt(data);
      const builder = new OtfBuilder(sfnt);
      const result = builder.build();
      console.log('WOFF converted to OTF, length:', result.length);
      return result;
    }
    console.error('Unsupported format:', format);
    throw new Error(`Unsupported format: ${format}`);
  }

  private woff2ToOtf(data: Uint8Array): Uint8Array {
    console.log('woff2ToOtf called, input length:', data.length);
    try {
      const uncompressed = this.woff2.uncompress(data);
      console.log('WOFF2 uncompressed successfully, length:', uncompressed.length);
      return uncompressed;
    } catch (error) {
      console.error('Error in woff2ToOtf:', error);
      throw error;
    }
  }

   toWoff(data: Uint8Array): Uint8Array {
    const format = getFontFormat(data);
    if (format === Format.WOFF) return data;
    if (format === Format.OTF) {
      const sfnt = readAsSfnt(data);
      const builder = new WoffBuilder(sfnt);
      return builder.build();
    }
    if (format === Format.WOFF2) {
      const uncompressed = this.woff2.uncompress(data);
      const sfnt = readAsSfnt(uncompressed);
      const builder = new WoffBuilder(sfnt);
      return builder.build();
    }
    throw new Error(`Unsupported format: ${format}`);
  }

  toWoff2(data: Uint8Array): Uint8Array {
    console.log('toWoff2 called, input length:', data.length);
    const format = getFontFormat(data);
    console.log('Input format:', format);
    if (format === Format.WOFF2) return data;
    if (format === Format.OTF) {
      return this.woff2.compress(data);
    }
    if (format === Format.WOFF) {
      const sfnt = readAsSfnt(data);
      const builder = new OtfBuilder(sfnt);
      const otf = builder.build();
      return this.woff2.compress(otf);
    }
    throw new Error(`Unsupported format: ${format}`);
  }

//   toWoff2(data: Uint8Array): Uint8Array {
//     const format = getFontFormat(data);
//     if (format === Format.WOFF2) return data;
//     if (format === Format.OTF) {
//       return this.woff2.compress(data);
//     }
//     if (format === Format.WOFF) {
//       const sfnt = readAsSfnt(data);
//       const builder = new OtfBuilder(sfnt);
//       const otf = builder.build();
//       return this.woff2.compress(otf);
//     }
//     throw new Error(`Unsupported format: ${format}`);
//   }
// }

}