
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let app: App;
let auth: Auth;
let firestore: Firestore;
let storage: Storage;

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const hasServiceAccount =
  serviceAccount.projectId &&
  serviceAccount.clientEmail &&
  serviceAccount.privateKey;

if (process.env.NODE_ENV === 'development' && !hasServiceAccount) {
  console.warn(
    'Firebase Admin SDK is not initialized. Required environment variables for the service account are missing. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in your .env.local file.'
  );
}

if (admin.apps.length === 0) {
  if (hasServiceAccount) {
    // Initialize with service account credentials
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Fallback for deployed environments like App Hosting
    // which use Application Default Credentials.
    app = admin.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
} else {
  app = admin.app();
}

auth = getAuth(app);
firestore = getFirestore(app);
storage = getStorage(app);

export { app, auth, firestore, storage };
