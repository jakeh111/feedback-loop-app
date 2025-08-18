
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let app: App;
let auth: Auth;
let firestore: Firestore;
let storage: Storage;

// This is the service account object that will be used to authenticate
// the Firebase Admin SDK. It's constructed from environment variables.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key from the environment variable needs to have its escaped newlines
  // replaced with actual newline characters.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Check if the service account credentials are fully provided.
const hasServiceAccount =
  serviceAccount.projectId &&
  serviceAccount.clientEmail &&
  serviceAccount.privateKey;

if (hasServiceAccount) {
  // If the SDK hasn't been initialized yet, do it now with the service account credentials.
  if (admin.apps.length === 0) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase Admin SDK initialized with service account.');
  } else {
    // If it's already initialized, just get the default app instance.
    app = admin.app();
  }
} else {
  // If service account is not available, try to initialize with Application Default Credentials.
  // This is useful for deployed environments like Google Cloud Run or App Hosting.
  if (admin.apps.length === 0) {
     app = admin.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     });
     console.log('Firebase Admin SDK initialized with Application Default Credentials.');
  } else {
    app = admin.app();
  }
}

// Get the services from the initialized app.
auth = getAuth(app);
firestore = getFirestore(app);
storage = getStorage(app);

export { app, auth, firestore, storage };
