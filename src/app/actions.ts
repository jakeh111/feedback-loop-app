
'use server';

import { summarizeFeedback, SummarizeFeedbackInput, SummarizeFeedbackOutput } from "@/ai/flows/summarize-feedback";
import { firestore, storage } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

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
    // Delete the Firestore document
    const trackDocRef = doc(firestore, 'tracks', trackId);
    await deleteDoc(trackDocRef);

    // Delete the file from Firebase Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
  } catch (error) {
    console.error("Error deleting track:", error);
    throw new Error("Failed to delete track.");
  }
}
