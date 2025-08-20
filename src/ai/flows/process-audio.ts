
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
    if (!meta.includes('wav')) {
        // If it's not a WAV file (e.g., it's already an MP3), just pass it through.
        return { processedAudioDataUri: input.audioDataUri };
    }
    
    const audioBuffer = Buffer.from(base64Data, 'base64');

    let pcmData: Int16Array | undefined;
    let sampleRate: number | undefined;
    let channels: number | undefined;

    try {
        const reader = new wav.Reader();
        
        const samplesPromise = new Promise<void>((resolve, reject) => {
            reader.on('format', (format) => {
                channels = format.channels;
                sampleRate = format.sampleRate;
            });
            
            let dataChunks: Buffer[] = [];
            reader.on('data', (chunk) => {
                 dataChunks.push(chunk);
            });

            reader.on('end', () => {
                const audioDataBuffer = Buffer.concat(dataChunks);
                // lamejs expects Int16Array, so we need to convert.
                // This assumes 16-bit audio from the WAV.
                const int16Pcm = new Int16Array(audioDataBuffer.buffer, audioDataBuffer.byteOffset, audioDataBuffer.length / 2);

                if (int16Pcm.length > 0) {
                    pcmData = int16Pcm;
                    resolve();
                } else {
                    reject(new Error("No PCM data was extracted from WAV file."));
                }
            });

            reader.on('error', reject);

            reader.end(audioBuffer);
        });
        
        await samplesPromise;

    } catch(e) {
        console.warn("Could not parse as WAV, passing through original data.", e);
        return { processedAudioDataUri: input.audioDataUri };
    }
    
    if (!pcmData || !channels || !sampleRate) {
         throw new Error("Could not extract PCM data or format from the audio buffer.");
    }
    
    const mp3encoder = new Mp3Encoder(channels, sampleRate, 128); // 128 kbps
    const mp3Data = [];

    const sampleBlockSize = 1152; 

    for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
        const sampleChunk = pcmData.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    const mp3buf = mp3encoder.flush();

    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
    
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
