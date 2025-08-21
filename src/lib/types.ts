

import type { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  endTimestamp?: number;
  avatarUrl: string;
  youtubeUrl?: string;
  youtubeTimestamp?: number;
  createdAt: Date | Timestamp;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  userId?: string;
  waveformData?: number[];
};

export const ProcessAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A base64 encoded audio file as a data URI, including a MIME type. E.g., 'data:audio/mpeg;base64, ...'"
    ),
});
export type ProcessAudioInput = z.infer<typeof ProcessAudioInputSchema>;

export const ProcessAudioOutputSchema = z.object({
  processedAudioDataUri: z
    .string()
    .describe('The processed audio file, returned as a base64 data URI.'),
});
export type ProcessAudioOutput = z.infer<typeof ProcessAudioOutputSchema>;

    