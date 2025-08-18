
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let app: App;
let auth: Auth;
let firestore: Firestore;
let storage: Storage;

// These are the credentials for the server-side Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const hasServiceAccount =
  serviceAccount.projectId &&
  serviceAccount.clientEmail &&
  serviceAccount.privateKey;

if (admin.apps.length === 0) {
  if (hasServiceAccount) {
    // We have credentials from .env.local, initialize with them
    console.log("Initializing Firebase Admin SDK with Service Account credentials.");
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // We don't have credentials, likely in a deployed environment
    // using Application Default Credentials.
    console.log("Initializing Firebase Admin SDK with Application Default Credentials.");
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
