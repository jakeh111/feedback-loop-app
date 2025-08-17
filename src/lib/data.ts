
import { firestore, auth } from './firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export type DashboardTrack = {
  id: string;
  title: string;
  comments: number; 
  date: string;
  storagePath: string;
};

// Function to get the current user as a Promise
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};


/**
 * Fetches the tracks for the currently logged-in user.
 */
export const getDashboardTracks = async (): Promise<DashboardTrack[]> => {
  const user = await getCurrentUser();

  if (!user) {
    // If no user is logged in, return an empty array.
    return [];
  }

  try {
    const q = query(
      collection(firestore, 'tracks'), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const tracks: DashboardTrack[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Safely handle the timestamp
      const date = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : new Date();

      return {
        id: doc.id,
        title: data.title || 'Untitled Track',
        comments: data.commentCount || 0,
        date: date.toLocaleDateString(),
        storagePath: data.storagePath || ''
      };
    });

    return tracks;
  } catch (error) {
    console.error("Error fetching user tracks:", error);
    // In case of an error, return an empty array to prevent crashes.
    return [];
  }
};
