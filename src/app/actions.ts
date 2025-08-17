
'use server';

import { summarizeFeedback, SummarizeFeedbackInput, SummarizeFeedbackOutput } from "@/ai/flows/summarize-feedback";
import { firestore, storage } from '@/lib/firebase-admin';
import { getAuth } from "firebase-admin/auth";

export async function getSummary(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  try {
    const summary = await summarizeFeedback(input);
    return summary;
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return { summary: "An error occurred while generating the summary." };
  }
}

export async function deleteTrack(trackId: string): Promise<void> {
  if (!trackId) {
    throw new Error("Track ID is required.");
  }

  const auth = getAuth();
  const user = auth.currentUser;

  // This check is for when the function is called in an environment where the user isn't authenticated via the Admin SDK.
  // In a real app, you'd want a more robust way to get the current user, like verifying an ID token passed from the client.
  // For now, we will assume the environment provides the user.
  if (!user) {
    throw new Error("Authentication required to delete a track.");
  }

  const trackDocRef = firestore.collection('tracks').doc(trackId);

  try {
    const trackDoc = await trackDocRef.get();

    if (!trackDoc.exists) {
      throw new Error("Track not found.");
    }

    const trackData = trackDoc.data();

    // *** SECURITY CHECK ***
    // Ensure the user trying to delete the track is the one who uploaded it.
    if (trackData?.userId !== user.uid) {
      throw new Error("Permission denied. You can only delete your own tracks.");
    }
    
    const storagePath = trackData?.storagePath;
    if (!storagePath) {
        // If there's no storage path, we can just delete the Firestore document.
        console.warn(`Track ${trackId} has no storage path. Deleting Firestore document only.`);
        await trackDocRef.delete();
        return;
    }

    // Delete the file from Firebase Storage first
    await storage.bucket().file(storagePath).delete();

    // Then, delete the Firestore document
    await trackDocRef.delete();
    
  } catch (error) {
    console.error("Error deleting track:", error);
     if (error instanceof Error) {
       // This will give us a more specific error message from Firebase
       throw new Error(error.message);
    }
    // Re-throw the original error to be caught by the client
    throw error;
  }
}
