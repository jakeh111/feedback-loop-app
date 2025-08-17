
'use server';

import { summarizeFeedback, SummarizeFeedbackInput, SummarizeFeedbackOutput } from "@/ai/flows/summarize-feedback";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const firestore = admin.firestore();
const storage = admin.storage();

export async function getSummary(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  try {
    const summary = await summarizeFeedback(input);
    return summary;
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return { summary: "An error occurred while generating the summary." };
  }
}

export async function deleteTrack(trackId: string, storagePath: string): Promise<void> {
  if (!trackId || !storagePath) {
    throw new Error("Track ID and storage path are required.");
  }
  
  try {
    // Delete the file from Firebase Storage first
    await storage.bucket().file(storagePath).delete();

    // Then, delete the Firestore document
    const trackDocRef = firestore.collection('tracks').doc(trackId);
    await trackDocRef.delete();
    
  } catch (error) {
    console.error("Error deleting track:", error);
    // Re-throw the original error to be caught by the client
    throw error;
  }
}
