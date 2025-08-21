'use server';

import {
  summarizeFeedback,
  SummarizeFeedbackInput,
  SummarizeFeedbackOutput,
} from '@/ai/flows/summarize-feedback';
import { firestore, storage } from '@/lib/firebase-admin';
import { FieldValue, doc, updateDoc } from 'firebase-admin/firestore';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

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

  const trackDocRef = doc(firestore, 'tracks', trackId);

  try {
    await updateDoc(trackDocRef, {
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
  // This is a placeholder for server-side waveform generation.
  // In a real app, you would use a library like 'node-audiowaveform'
  // which requires native dependencies. For now, we'll create a random one.
  const randomWaveform = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));
  return Promise.resolve(randomWaveform);
}


async function convertToMp3(inputBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const outputStream = new (require('stream').PassThrough)();
        const chunks: any[] = [];

        outputStream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        outputStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        outputStream.on('error', reject);
        
        const inputStream = new Readable();
        inputStream.push(inputBuffer);
        inputStream.push(null);

        ffmpeg(inputStream)
            .toFormat('mp3')
            .on('error', (err) => {
                console.error('An error occurred: ' + err.message);
                reject(err);
            })
            .pipe(outputStream, { end: true });
    });
}


export async function processAndStoreTrack({
  tempStoragePath,
  originalFilename,
  userId,
  artistName,
}: {
  tempStoragePath: string;
  originalFilename: string;
  userId: string;
  artistName: string;
}): Promise<string> {
    const bucket = storage.bucket();
    const tempFile = bucket.file(tempStoragePath);
    
    try {
        const [tempFileBuffer] = await tempFile.download();

        let audioBuffer: Buffer;
        let finalFilename = originalFilename;
        const fileExt = path.extname(originalFilename).toLowerCase();

        if (fileExt === '.wav') {
            console.log("Converting WAV to MP3...");
            audioBuffer = await convertToMp3(tempFileBuffer);
            finalFilename = originalFilename.replace(/\.wav$/i, '.mp3');
        } else {
            audioBuffer = tempFileBuffer;
        }

        console.log("Generating waveform...");
        const waveform = await generateWaveformData(audioBuffer);

        console.log("Uploading final file...");
        // Corrected Path: Upload to a user-specific tracks directory
        const permanentStoragePath = `${userId}/tracks/${Date.now()}-${finalFilename}`;
        const permanentFile = bucket.file(permanentStoragePath);
        
        await permanentFile.save(audioBuffer, {
            metadata: { contentType: 'audio/mpeg' },
        });

        const [downloadURL] = await permanentFile.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // Far future expiration
        });

        console.log("Creating Firestore document...");
        const trackTitle = finalFilename.replace(/\.[^/.]+$/, "");
        const trackDocRef = await firestore.collection('tracks').add({
            title: trackTitle,
            artist: artistName,
            audioUrl: downloadURL,
            storagePath: permanentStoragePath,
            waveform: waveform,
            userId: userId,
            createdAt: FieldValue.serverTimestamp(),
            commentCount: 0,
        });

        return trackDocRef.id;
    } catch (error) {
        console.error('Error processing track:', error);
        throw new Error('Failed to process and store track.');
    } finally {
        console.log("Cleaning up temporary file...");
        await tempFile.delete().catch(err => console.error("Failed to delete temp file:", err));
    }
}
