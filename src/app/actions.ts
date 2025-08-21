
'use server';

import {
  summarizeFeedback,
  SummarizeFeedbackInput,
  SummarizeFeedbackOutput,
} from '@/ai/flows/summarize-feedback';
import { firestore, storage } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function getSummary(
  input: SummarizeFeedbackInput
): Promise<SummarizeFeedbackOutput> {
  try {
    const summary = await summarizeFeedback(input);
    return summary;
  } catch (error) {
    console.error('Error summarizing feedback:', error);
    return { summary: 'An error occurred while generating the summary.' };
  }
}

export async function addComment(
  trackId: string,
  commentData: {
    author: string;
    text: string;
    timestamp: number;
    endTimestamp?: number;
    avatarUrl: string;
    youtubeUrl?: string;
    youtubeTimestamp?: number;
  }
) {
  if (!trackId) {
    throw new Error('Track ID is required.');
  }

  const trackRef = firestore.collection('tracks').doc(trackId);
  const commentsRef = trackRef.collection('comments');

  try {
    // In a transaction, add the new comment and increment the comment count
    await firestore.runTransaction(async (transaction) => {
      const trackDoc = await transaction.get(trackRef);
      if (!trackDoc.exists) {
        throw new Error('Track not found.');
      }

      // Add the new comment
      const newCommentRef = commentsRef.doc();
      transaction.set(newCommentRef, {
        ...commentData,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Increment the comment count on the track
      transaction.update(trackRef, {
        commentCount: FieldValue.increment(1),
      });
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function deleteTrack(trackId: string): Promise<void> {
  if (!trackId) {
    throw new Error('Track ID is required.');
  }

  const trackDocRef = firestore.collection('tracks').doc(trackId);

  try {
    const trackDoc = await trackDocRef.get();

    if (!trackDoc.exists) {
      console.log(`Track ${trackId} not found. Skipping deletion.`);
      return;
    }

    const trackData = trackDoc.data();

    // Delete all comments in the subcollection first
    const commentsQuery = trackDocRef.collection('comments');
    const commentsSnapshot = await commentsQuery.get();
    if (!commentsSnapshot.empty) {
      const batch = firestore.batch();
      commentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Then, delete the file from Firebase Storage
    const storagePath = trackData?.storagePath;
    if (storagePath) {
      try {
        await storage.bucket().file(storagePath).delete();
      } catch (storageError: any) {
        if (storageError.code !== 404) {
          throw storageError; // Re-throw other storage errors
        }
      }
    }

    // Finally, delete the Firestore document
    await trackDocRef.delete();
  } catch (error) {
    console.error(`Error deleting track ${trackId}:`, error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function renameTrack(
  trackId: string,
  newTitle: string
): Promise<void> {
  if (!trackId) {
    throw new Error('Track ID is required.');
  }
  if (!newTitle || newTitle.trim().length === 0) {
    throw new Error('New title cannot be empty.');
  }

  const trackDocRef = firestore.collection('tracks').doc(trackId);

  try {
    await trackDocRef.update({
      title: newTitle.trim(),
    });
  } catch (error) {
    console.error(`Error renaming track ${trackId}:`, error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}

async function generateWaveformData(audioBuffer: Buffer): Promise<number[]> {
  try {
    // This is a simplified approach that should work on a server.
    // It assumes 16-bit PCM audio. For MP3s, you'd need a server-side decoding library.
    // This is a placeholder and might not produce accurate results for all file types.
    const sampleSize = 200; // Number of points in the waveform
    const waveform = [];

    // A very basic check for WAV header to find where data starts.
    // This is NOT a robust parser.
    const dataChunkIdentifier = 'data';
    let dataStartIndex = audioBuffer.indexOf(dataChunkIdentifier);
    if (dataStartIndex === -1) {
      // Fallback for files without obvious 'data' chunk, like some MP3s.
      // This is highly unreliable.
      dataStartIndex = 44; 
    } else {
      dataStartIndex += 8; // Move past 'data' and chunk size
    }
    dataStartIndex = Math.max(dataStartIndex, 0);


    const audioData = audioBuffer.slice(dataStartIndex);
    const blockSize = Math.floor(audioData.length / sampleSize);

    if (blockSize < 2) {
       console.warn("Audio buffer is too small for waveform generation. Returning empty array.");
       return Array(sampleSize).fill(0);
    }
    
    for (let i = 0; i < sampleSize; i++) {
      const start = i * blockSize;
      // Ensure we don't read past the end of the buffer
      const end = Math.min(start + blockSize, audioData.length);
      
      let sum = 0;
      let count = 0;
      // Iterate by 2 bytes for 16-bit audio
      for (let j = start; j < end - 1; j += 2) {
        try {
            // Using signed 16-bit little-endian format, common for WAV
            const sample = audioData.readInt16LE(j);
            sum += Math.abs(sample);
            count++;
        } catch (e) {
            // This can happen if we are not aligned correctly.
            // We can ignore this sample.
        }
      }
      
      if (count > 0) {
          const average = sum / count;
          // Normalize to a 0-100 scale. 32767 is the max value for 16-bit audio.
          const normalized = Math.floor((average / 32767) * 100);
          waveform.push(normalized);
      } else {
          waveform.push(0);
      }
    }
    
    return waveform;
  } catch (error) {
    console.error('Error generating waveform:', error);
    // Return a random waveform as a fallback
    return Array.from({ length: 200 }, () => Math.floor(Math.random() * 100));
  }
}


export async function processAndStoreTrack({
  storagePath,
  originalFilename,
  userId,
  artistName
}: {
  storagePath: string;
  originalFilename: string;
  userId: string;
  artistName: string;
}): Promise<string> {
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    
    try {
        const [downloadURL] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // Far future expiration
        });

        // Download the file to a buffer to generate waveform
        const [audioBuffer] = await file.download();
        const waveformData = await generateWaveformData(audioBuffer);
        
        console.log("Creating Firestore document...");
        const trackTitle = originalFilename.replace(/\.[^/.]+$/, "");
        const trackDocRef = await firestore.collection('tracks').add({
            title: trackTitle,
            artist: artistName,
            audioUrl: downloadURL,
            storagePath: storagePath,
            userId: userId,
            createdAt: FieldValue.serverTimestamp(),
            commentCount: 0,
            waveformData: waveformData,
        });

        return trackDocRef.id;
    } catch (error) {
        console.error('Error processing track:', error);
        // If something goes wrong, try to delete the orphaned file.
        await file.delete().catch(err => console.error("Failed to delete orphaned file:", err));
        throw new Error('Failed to process and store track.');
    }
}

    