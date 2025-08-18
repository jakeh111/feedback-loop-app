
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

// DEBUGGING: Log environment variables to check if they are loaded correctly.
console.log("Attempting to initialize Firebase Admin SDK with these env vars:");
console.log({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Check if the private key exists to avoid printing the whole secret key
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Loaded Successfully' : 'NOT LOADED', 
});


// This singleton pattern prevents the Firebase Admin SDK from being initialized multiple times
// during Next.js hot-reloading in a development environment. This is a robust solution to
// prevent the "already exists" error and other initialization-related issues.

const initializeAdminApp = (): {
  app: App;
  auth: Auth;
  firestore: Firestore;
  storage: Storage;
} => {
  // When running locally, the SDK needs explicit credentials provided via environment variables.
  // In a deployed environment (like App Hosting), the SDK can automatically discover credentials.
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace the escaped newlines from the env variable with actual newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    // Local development: Use service account credentials from .env
    if (admin.apps.length === 0) {
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      return {
        app,
        auth: getAuth(app),
        firestore: getFirestore(app),
        storage: getStorage(app),
      };
    }
    const app = admin.apps[0]!;
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };

  } else {
    // Deployed environment: Use application default credentials
     if (admin.apps.length === 0) {
        const app = admin.initializeApp({
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        return {
            app,
            auth: getAuth(app),
            firestore: getFirestore(app),
            storage: getStorage(app),
        };
     }
     const app = admin.apps[0]!;
     return {
        app,
        auth: getAuth(app),
        firestore: getFirestore(app),
        storage: getStorage(app),
     }
  }
};

// Initialize the app using the singleton pattern
const { app, auth, firestore, storage } = globalThis.firebaseAdmin ?? (globalThis.firebaseAdmin = initializeAdminApp());

export { app, auth, firestore, storage };
