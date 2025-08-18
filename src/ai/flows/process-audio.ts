
'use server';

/**
 * @fileOverview Processes an audio file, compressing it to a smaller MP3 format.
 *
 * - processAudio - A function that takes audio data and returns the processed data.
 */

import {ai} from '@/ai/genkit';
import { Mp3Encoder } from 'lamejs';
import wav from 'wav';
import { ProcessAudioInput, ProcessAudioInputSchema, ProcessAudioOutput, ProcessAudioOutputSchema } from '@/lib/types';


export async function processAudio(input: ProcessAudioInput): Promise<ProcessAudioOutput> {
  return processAudioFlow(input);
}


const processAudioFlow = ai.defineFlow(
  {
    name: 'processAudioFlow',
    inputSchema: ProcessAudioInputSchema,
    outputSchema: ProcessAudioOutputSchema,
  },
  async (input) => {
    
    const [meta, base64Data] = input.audioDataUri.split(',');
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // This is a simplified path for WAV files. A robust solution would properly
    // parse the WAV header to get channels, sample rate, etc.
    // For now, we assume a standard format that lamejs can handle.
    // This will likely fail on MP3 inputs, as we're not decoding them to PCM first.
    // The goal here is to handle the common case of WAV upload for compression.
    const Lame = require('lamejs');

    let pcmData;
    let sampleRate;
    let channels;

    try {
        const reader = new wav.Reader();
        
        const samplesPromise = new Promise<Int16Array>((resolve, reject) => {
            reader.on('format', (format) => {
                channels = format.channels;
                sampleRate = format.sampleRate;
            });
            
            let dataChunks: Buffer[] = [];
            reader.on('data', (chunk) => {
                 dataChunks.push(chunk);
            });

            reader.on('end', () => {
                const audioBuffer = Buffer.concat(dataChunks);
                // lamejs expects Int16Array, so we need to convert.
                // This assumes 16-bit audio from the WAV.
                const int16Pcm = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.length / 2);

                if (int16Pcm.length > 0) {
                    pcmData = int16Pcm;
                    resolve(int16Pcm);
                } else {
                    reject(new Error("No PCM data was extracted."));
                }
            });

            reader.on('error', reject);

            reader.end(audioBuffer);
        });
        
        await samplesPromise;

    } catch(e) {
        // This is not a WAV file, or it's a format we don't recognize.
        // For this example, we'll throw an error. A more complex app might
        // try to use a different decoder for MP3s to convert to PCM first.
        console.warn("Could not parse as WAV, this is likely an MP3. Re-encoding MP3s is not yet supported in this flow.", e);
        // For now, we just pass through the original data if it's not a WAV
        return { processedAudioDataUri: input.audioDataUri };
    }
    
    if (!pcmData || !channels || !sampleRate) {
         throw new Error("Could not extract PCM data or format from the audio buffer.");
    }
    
    const mp3encoder = new Lame.Mp3Encoder(channels, sampleRate, 128); // 128 kbps
    const mp3Data = [];

    const sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier

    for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
        const sampleChunk = pcmData.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    const mp3buf = mp3encoder.flush();   //finish writing mp3

    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
    
    // The mp3Data is an array of Uint8Arrays, we need to concat them.
    const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
    const concatenatedMp3 = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of mp3Data) {
        concatenatedMp3.set(buf, offset);
        offset += buf.length;
    }

    const processedMp3Buffer = Buffer.from(concatenatedMp3);
    const processedAudioDataUri = `data:audio/mpeg;base64,${processedMp3Buffer.toString('base64')}`;

    return {
      processedAudioDataUri,
    };
  }
);
