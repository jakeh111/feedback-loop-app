
'use server';

import {
  summarizeFeedback,
  SummarizeFeedbackInput,
  SummarizeFeedbackOutput,
} from '@/ai/flows/summarize-feedback';
import { firestore, storage } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

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
  // This is a placeholder for server-side waveform generation.
  // In a real app, you would use a library like 'node-audiowaveform'
  // which requires native dependencies. For now, we'll create a random one.
  const randomWaveform = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));
  return Promise.resolve(randomWaveform);
}

async function convertToMp3(inputBuffer: Buffer): Promise<Buffer> {
  const ffmpeg = createFFmpeg({ log: true });
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
  const inputFileName = 'input.wav';
  const outputFileName = 'output.mp3';
  ffmpeg.FS('writeFile', inputFileName, await fetchFile(inputBuffer));
  
  // Convert WAV to MP3
  await ffmpeg.run('-i', inputFileName, '-acodec', 'libmp3lame', '-b:a', '192k', outputFileName);
  
  const data = ffmpeg.FS('readFile', outputFileName);

  // Cleanup FFmpeg file system
  ffmpeg.FS('unlink', inputFileName);
  ffmpeg.FS('unlink', outputFileName);
  
  return Buffer.from(data.buffer);
}


export async function processAndStoreTrack({
  storagePath,
  originalFilename,
  userId,
  artistName,
  contentType,
}: {
  storagePath: string;
  originalFilename: string;
  userId: string;
  artistName: string;
  contentType: string;
}): Promise<string> {
    const bucket = storage.bucket();
    const tempFile = bucket.file(storagePath);
    
    try {
        const [fileBuffer] = await tempFile.download();

        let processedBuffer: Buffer;
        let finalContentType: string;
        let finalStoragePath: string;

        if (contentType === 'audio/wav' || contentType === 'audio/wave') {
            console.log("Converting WAV to MP3...");
            processedBuffer = await convertToMp3(fileBuffer);
            finalContentType = 'audio/mpeg';
            finalStoragePath = storagePath.replace(/\.[^/.]+$/, '.mp3');
        } else {
            processedBuffer = fileBuffer;
            finalContentType = contentType;
            finalStoragePath = storagePath;
        }

        // Upload the processed file
        const finalFile = bucket.file(finalStoragePath);
        await finalFile.save(processedBuffer, {
            metadata: { contentType: finalContentType },
        });

        // If we converted the file, delete the original temporary file
        if (finalStoragePath !== storagePath) {
            await tempFile.delete();
        }

        const [downloadURL] = await finalFile.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // Far future expiration
        });
        
        const waveform = await generateWaveformData(processedBuffer);

        console.log("Creating Firestore document...");
        const trackTitle = originalFilename.replace(/\.[^/.]+$/, "");
        const trackDocRef = await firestore.collection('tracks').add({
            title: trackTitle,
            artist: artistName,
            audioUrl: downloadURL,
            storagePath: finalStoragePath,
            waveform: waveform,
            userId: userId,
            createdAt: FieldValue.serverTimestamp(),
            commentCount: 0,
        });

        return trackDocRef.id;
    } catch (error) {
        console.error('Error processing track:', error);
        // If something goes wrong, try to delete the orphaned file(s).
        await tempFile.delete().catch(err => console.error("Failed to delete temp file:", err));
        if (storagePath.includes('.wav')) {
             await bucket.file(storagePath.replace(/\.wav$/i, '.mp3')).delete().catch(err => console.error("Failed to delete orphaned mp3 file:", err));
        }
        throw new Error('Failed to process and store track.');
    }
}
