
'use server';

import {
  summarizeFeedback,
  SummarizeFeedbackInput,
  SummarizeFeedbackOutput,
} from '@/ai/flows/summarize-feedback';
import { firestore, storage } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Mp3Decoder } from '@breezystack/lamejs';

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
    await firestore.runTransaction(async (transaction) => {
      const trackDoc = await transaction.get(trackRef);
      if (!trackDoc.exists) {
        throw new Error('Track not found.');
      }

      const newCommentRef = commentsRef.doc();
      transaction.set(newCommentRef, {
        ...commentData,
        createdAt: FieldValue.serverTimestamp(),
        completed: false,
        subComments: [],
      });

      transaction.update(trackRef, {
        commentCount: FieldValue.increment(1),
        lastCommentedAt: FieldValue.serverTimestamp(),
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

export async function addReplyToComment(
  trackId: string,
  commentId: string,
  replyData: {
    author: string;
    text: string;
    avatarUrl: string;
    userId: string;
  }
) {
  if (!trackId || !commentId) {
    throw new Error('Track ID and Comment ID are required.');
  }
  
  const trackRef = firestore.collection('tracks').doc(trackId);
  const commentRef = trackRef.collection('comments').doc(commentId);

  try {
    const trackDoc = await trackRef.get();
    if (!trackDoc.exists || trackDoc.data()?.userId !== replyData.userId) {
      throw new Error("You are not authorized to reply to this comment.");
    }
    
    const newReply = {
      id: new Date().getTime().toString(), // simple unique id
      ...replyData,
      createdAt: new Date(),
    };
    
    await commentRef.update({
      subComments: FieldValue.arrayUnion(newReply)
    });

  } catch (error) {
    console.error("Error adding reply to comment:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw error;
  }
}


export async function toggleCommentCompleted(trackId: string, commentId: string, completed: boolean, userId: string) {
    if (!trackId || !commentId || !userId) {
        throw new Error("Track ID, Comment ID, and User ID are required.");
    }
    
    const trackRef = firestore.collection('tracks').doc(trackId);
    const commentRef = trackRef.collection('comments').doc(commentId);

    try {
        const trackDoc = await trackRef.get();
        if (!trackDoc.exists || trackDoc.data()?.userId !== userId) {
            throw new Error("You are not authorized to modify this comment.");
        }
        
        await commentRef.update({ completed: completed });

    } catch(error) {
        console.error("Error toggling comment completion:", error);
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

    const commentsQuery = trackDocRef.collection('comments');
    const commentsSnapshot = await commentsQuery.get();
    if (!commentsSnapshot.empty) {
      const batch = firestore.batch();
      commentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

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

async function generateWaveformData(mp3Buffer: Buffer): Promise<number[]> {
  try {
    const decoder = new Mp3Decoder();
    const decoded = decoder.decode(mp3Buffer);

    if (!decoded) {
      throw new Error("Failed to decode MP3 file.");
    }
    
    const pcmData = new Int16Array(decoded.channel1.length);
    for (let i = 0; i < decoded.channel1.length; i++) {
        pcmData[i] = (decoded.channel1[i] + decoded.channel2[i]) / 2;
    }

    const sampleSize = 200; // Number of points in the waveform
    const waveform = [];
    const blockSize = Math.floor(pcmData.length / sampleSize);

    if (blockSize === 0) {
      console.warn("Audio buffer is too small for meaningful waveform generation.");
      return Array(sampleSize).fill(0);
    }
    
    for (let i = 0; i < sampleSize; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      let sum = 0;
      
      for (let j = start; j < end; j++) {
        sum += Math.abs(pcmData[j] || 0);
      }
      
      const average = sum / blockSize;
      const normalized = Math.min(100, Math.floor((average / 32767) * 100));
      waveform.push(normalized);
    }
    
    return waveform;
  } catch (error) {
    console.error('Error generating waveform:', error);
    return Array.from({ length: 200 }, () => Math.floor(Math.random() * 50) + 5);
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

        const [audioBuffer] = await file.download();
        const waveform = await generateWaveformData(audioBuffer);
        
        console.log("Creating Firestore document...");
        const trackTitle = originalFilename.replace(/\.[^/.]+$/, "");
        const trackDocRef = await firestore.collection('tracks').add({
            title: trackTitle,
            artist: artistName,
            audioUrl: downloadURL,
            storagePath: storagePath,
            userId: userId,
            createdAt: FieldValue.serverTimestamp(),
            lastViewedAt: FieldValue.serverTimestamp(),
            commentCount: 0,
            waveform: waveform,
        });

        return trackDocRef.id;
    } catch (error) {
        console.error('Error processing track:', error);
        await file.delete().catch(err => console.error("Failed to delete orphaned file:", err));
        throw new Error('Failed to process and store track.');
    }
}
