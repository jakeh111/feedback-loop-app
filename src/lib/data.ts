
import { firestore } from './firebase';
import { collection, query, where, Timestamp, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';

export type DashboardTrack = {
  id: string;
  title: string;
  comments: number; 
  date: string;
  storagePath: string;
};

/**
 * Sets up a realtime listener for the dashboard tracks for a given user.
 * @param userId - The ID of the user whose tracks to fetch.
 * @param callback - A function that will be called with the tracks array whenever it updates.
 * @returns An unsubscribe function to detach the listener.
 */
export const getDashboardTracks = (userId: string, callback: (tracks: DashboardTrack[]) => void): Unsubscribe => {
  const q = query(
    collection(firestore, 'tracks'),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  // onSnapshot returns its own unsubscribe function, which we return to the caller.
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tracks: DashboardTrack[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
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
    callback(tracks);
  }, (error) => {
    console.error("Error fetching real-time tracks:", error);
    // In case of an error, provide an empty array.
    callback([]);
  });

  return unsubscribe;
};
