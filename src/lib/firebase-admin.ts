
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app;

// This pattern is crucial to prevent re-initializing the SDK in the
// Next.js hot-reloading development environment.
if (admin.apps.length === 0) {
  app = admin.initializeApp({
    // Explicitly providing the project ID and storage bucket can resolve
    // credential discovery issues in some environments.
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  app = admin.apps[0]!;
}

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
