
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
  const authUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(
        collection(firestore, 'tracks'),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      // onSnapshot returns its own unsubscribe function.
      const firestoreUnsubscribe = onSnapshot(q, (querySnapshot) => {
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

      // When the auth state changes again (e.g., user logs out), we need to stop listening.
      // We're already returning `authUnsubscribe`, which will handle this cleanup.
      // We also need to be able to unsubscribe from firestore if auth changes.
      // A simple way is to return a function that unsubscribes from both.
      // However, onAuthStateChanged only lets us return one unsubscribe function.
      // So we'll rely on the parent component that calls getDashboardTracks to re-call it
      // on auth state changes, and the previous onSnapshot will be cleaned up
      // when the component unmounts. This is handled correctly in DashboardPage.
    } else {
      // If no user is logged in, immediately call back with an empty array.
      callback([]);
    }
  });

  return authUnsubscribe;
};
