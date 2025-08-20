'use server';

import {
  summarizeFeedback,
  SummarizeFeedbackInput,
  SummarizeFeedbackOutput,
} from '@/ai/flows/summarize-feedback';
import { firestore, storage } from '@/lib/firebase-admin';
import { FieldValue, doc, updateDoc } from 'firebase-admin/firestore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

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
