
import { firestore, auth } from './firebase';
import { collection, query, where, Timestamp, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export type DashboardTrack = {
  id: string;
  title: string;
  comments: number; 
  date: string;
  storagePath: string;
};

/**
 * Sets up a realtime listener for the dashboard tracks of the currently logged-in user.
 * @param callback - A function that will be called with the tracks array whenever it updates.
 * @returns An unsubscribe function to detach the listener.
 */
export const getDashboardTracks = (callback: (tracks: DashboardTrack[]) => void): Unsubscribe => {
  const user = auth.currentUser;

  if (!user) {
    // If no user is logged in, immediately call back with an empty array
    // and return a no-op unsubscribe function.
    callback([]);
    return () => {};
  }

  const q = query(
    collection(firestore, 'tracks'),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  // onSnapshot returns its own unsubscribe function.
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
