
'use server';

import { summarizeFeedback, SummarizeFeedbackInput, SummarizeFeedbackOutput } from "@/ai/flows/summarize-feedback";
import { firestore, storage } from '@/lib/firebase-admin';
import { FieldValue, doc, updateDoc } from "firebase-admin/firestore";
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

// It's recommended to set the path to ffmpeg and ffprobe binaries
// If they are in the system's PATH, it might not be necessary, but it's safer.
// In a real cloud environment (like Cloud Functions), you'd need to bundle ffmpeg.
// For App Hosting, you might need to install it via Dockerfile or other means.
// For local dev, ensure ffmpeg is installed and in your PATH.
// ffmpeg.setFfmpegPath('/path/to/your/ffmpeg');
// ffmpeg.setFfprobePath('/path/to/your/ffprobe');


export async function getSummary(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  try {
    const summary = await summarizeFeedback(input);
    return summary;
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return { summary: "An error occurred while generating the summary." };
  }
}

export async function addComment(trackId: string, commentData: {
  author: string;
  text: string;
  timestamp: number;
  endTimestamp?: number;
  avatarUrl: string;
  youtubeUrl?: string;
  youtubeTimestamp?: number;
}) {
  if (!trackId) {
    throw new Error("Track ID is required.");
  }

  const trackRef = firestore.collection('tracks').doc(trackId);
  const commentsRef = trackRef.collection('comments');

  try {
    // In a transaction, add the new comment and increment the comment count
    await firestore.runTransaction(async (transaction) => {
      const trackDoc = await transaction.get(trackRef);
      if (!trackDoc.exists) {
        throw new Error("Track not found.");
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
    console.error("Error adding comment:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}


export async function deleteTrack(trackId: string): Promise<void> {
  if (!trackId) {
    throw new Error("Track ID is required.");
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
      commentsSnapshot.docs.forEach(doc => {
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

    // Also delete the original wav if it exists
     const originalStoragePath = trackData?.originalStoragePath;
    if (originalStoragePath && originalStoragePath !== storagePath) {
        try {
            await storage.bucket().file(originalStoragePath).delete();
        } catch (storageError: any) {
            if (storageError.code !== 404) {
                console.error("Could not delete original file:", storageError);
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

export async function renameTrack(trackId: string, newTitle: string): Promise<void> {
  if (!trackId) {
    throw new Error("Track ID is required.");
  }
  if (!newTitle || newTitle.trim().length === 0) {
    throw new Error("New title cannot be empty.");
  }
  
  // NOTE: In a real production app, you MUST verify that the user calling this
  // function is the owner of the track.

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

export async function processWavToMp3(storagePath: string, trackId: string): Promise<{ downloadURL: string; newStoragePath: string }> {
  if (!storagePath.toLowerCase().endsWith('.wav')) {
    throw new Error('File is not a WAV file.');
  }

  const bucket = storage.bucket();
  const file = bucket.file(storagePath);
  const tempFilePath = path.join(os.tmpdir(), path.basename(storagePath));
  const mp3FileName = `${path.basename(storagePath, '.wav')}.mp3`;
  const tempMp3Path = path.join(os.tmpdir(), mp3FileName);

  try {
    // Download the WAV file to a temporary location
    await file.download({ destination: tempFilePath });

    // Convert WAV to MP3
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempFilePath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .toFormat('mp3')
        .on('error', (err) => {
          console.error('ffmpeg error:', err);
          reject(new Error(`Failed to convert WAV to MP3: ${err.message}`));
        })
        .on('end', () => {
          resolve();
        })
        .save(tempMp3Path);
    });

    // Upload the new MP3 file to storage
    const newPath = `tracks/${path.dirname(storagePath).split('/').pop()}/${mp3FileName}`;
    const [uploadedFile] = await bucket.upload(tempMp3Path, {
      destination: newPath,
      metadata: {
        contentType: 'audio/mpeg',
      },
    });

    // Get the public URL
    const downloadURL = await uploadedFile.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far-future date
    }).then(urls => urls[0]);

    // Update the Firestore document with the new URL and path
    await firestore.collection('tracks').doc(trackId).update({
      audioUrl: downloadURL,
      storagePath: newPath, // Update storage path to the mp3
      originalStoragePath: storagePath // Keep track of original wav
    });
    
    // Clean up temporary files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempMp3Path);

    return { downloadURL, newStoragePath: newPath };

  } catch (error) {
    console.error('Error in WAV to MP3 processing:', error);
    // Clean up temp files on error
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(tempMp3Path)) fs.unlinkSync(tempMp3Path);
    throw error; // Re-throw the error to be handled by the caller
  }
}