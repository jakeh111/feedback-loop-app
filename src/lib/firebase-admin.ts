
import * as admin from 'firebase-admin';

// This is a robust way to initialize Firebase Admin SDK in a serverless environment like Next.js
// It checks if an app is already initialized to prevent errors during hot-reloads.
const app = admin.apps.length
  ? admin.apps[0]!
  : admin.initializeApp({
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

const firestore = admin.firestore(app);
const storage = admin.storage(app);

export { app, firestore, storage };
