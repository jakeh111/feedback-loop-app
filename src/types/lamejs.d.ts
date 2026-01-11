
declare module '@breezystack/lamejs' {
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, bitRate: number);
    encodeBuffer(pcm: Int16Array): Int8Array;
    flush(): Int8Array;
  }
  
  export class Mp3Decoder {
    constructor(options?: any);
    decode(buffer: Buffer): {
        channel1: Int16Array;
        channel2: Int16Array;
    } | undefined;
    decodeFrame(buffer: Buffer): any;
  }
  
  export class WavHeader {
    static readHeader(dataView: DataView): {
        channels: number;
        sampleRate: number;
        dataOffset: number;
        dataLen: number;
    };
  }
}
