
'use server';

import { summarizeFeedback, SummarizeFeedbackInput, SummarizeFeedbackOutput } from "@/ai/flows/summarize-feedback";
import { firestore, storage } from '@/lib/firebase-admin';

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
      throw new Error("Track not found.");
    }

    const trackData = trackDoc.data();

    // *** SECURITY CHECK ***
    // This is where you would compare the calling user's ID with the track owner's ID.
    // if (trackData?.userId !== callingUserId) {
    //   throw new Error("Permission denied. You can only delete your own tracks.");
    // }
    
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
