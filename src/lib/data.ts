
import { firestore, auth } from './firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';

export type DashboardTrack = {
  id: string;
  title: string;
  comments: number; // For now, we'll keep this as a static number. We can wire this up later.
  date: string;
};

/**
 * Fetches the tracks for the currently logged-in user.
 */
export const getDashboardTracks = async (): Promise<DashboardTrack[]> => {
  const user = auth.currentUser;
  if (!user) {
    // If the user is not logged in, return an empty array.
    // This can happen during server-side rendering before auth state is available.
    return [];
  }

  try {
    const tracksCollection = collection(firestore, 'tracks');
    const q = query(tracksCollection, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    
    const tracks: DashboardTrack[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      
      return {
        id: doc.id,
        title: data.title || 'Untitled Track',
        // We'll placeholder the comment count for now.
        comments: 0,
        date: createdAt ? createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
      };
    });

    return tracks;
  } catch (error) {
    console.error("Error fetching user tracks:", error);
    // In case of an error, return an empty array to prevent the page from crashing.
    return [];
  }
};
