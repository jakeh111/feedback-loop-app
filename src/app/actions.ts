
'use server';

import { summarizeFeedback, SummarizeFeedbackInput, SummarizeFeedbackOutput } from "@/ai/flows/summarize-feedback";
import { processAudio, ProcessAudioInput, ProcessAudioOutput } from "@/ai/flows/process-audio";
import { firestore, storage } from '@/lib/firebase-admin';
import { FieldValue } from "firebase-admin/firestore";

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
  
  // NOTE: In a real production app, you MUST verify that the user calling this
  // function is the owner of the track. This typically involves getting the
  // user's ID token on the client, passing it to the server action, and
  // verifying it with the Admin SDK.
  //
  // For example:
  // const decodedToken = await getAuth().verifyIdToken(idToken);
  // const callingUserId = decodedToken.uid;
  
  const trackDocRef = firestore.collection('tracks').doc(trackId);

  try {
    const trackDoc = await trackDocRef.get();

    if (!trackDoc.exists) {
      // If the document doesn't exist, it might have been already deleted.
      // We can just return successfully.
      console.log(`Track ${trackId} not found. Skipping deletion.`);
      return;
    }

    const trackData = trackDoc.data();

    // *** SECURITY CHECK ***
    // This is where you would compare the calling user's ID with the track owner's ID.
    // if (trackData?.userId !== callingUserId) {
    //   throw new Error("Permission denied. You can only delete your own tracks.");
    // }
    
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
            // If the file doesn't exist in storage, we can ignore the error
            // and proceed with deleting the Firestore document.
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
       // This will give us a more specific error message from Firebase
       throw new Error(error.message);
    }
    // Re-throw the original error to be caught by the client
    throw error;
  }
}

export async function deleteAllUserTracks(userId: string): Promise<{deletedCount: number}> {
    if (!userId) {
        throw new Error("User ID is required.");
    }
    // NOTE: This is a destructive operation. In a real production app,
    // you would add extra security checks to ensure only authorized users
    // can perform this action.

    const tracksQuery = firestore.collection('tracks').where('userId', '==', userId);
    const snapshot = await tracksQuery.get();

    if (snapshot.empty) {
        return { deletedCount: 0 };
    }

    let deletedCount = 0;
    const deletePromises: Promise<void>[] = [];

    snapshot.forEach(doc => {
        deletePromises.push(deleteTrack(doc.id));
        deletedCount++;
    });

    await Promise.all(deletePromises);

    return { deletedCount };
}


export async function processAudioAction(input: ProcessAudioInput): Promise<ProcessAudioOutput> {
  try {
    return await processAudio(input);
  } catch (error) {
    console.error("Error processing audio:", error);
    if (error instanceof Error) {
      throw new Error(`Audio processing failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during audio processing.");
  }
}
