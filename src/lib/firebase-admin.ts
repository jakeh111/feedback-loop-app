
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

// In a Next.js development environment, hot-reloading can cause the Firebase Admin SDK
// to be initialized multiple times, leading to errors. This pattern ensures it's
// initialized only once.

let app: App;
let auth: Auth;
let firestore: Firestore;
let storage: Storage;

if (admin.apps.length === 0) {
  // When running locally, the SDK needs explicit credentials.
  // These are provided via environment variables.
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace the escaped newlines from the env variable with actual newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // In a deployed environment (like App Hosting), the SDK can automatically
  // discover credentials. We check if the essential env vars are set to
  // decide which initialization method to use.
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
     app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     });
  } else {
    // This will be used in the deployed App Hosting environment
    app = admin.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
} else {
  app = admin.apps[0]!;
}

auth = getAuth(app);
firestore = getFirestore(app);
storage = getStorage(app);

export { app, auth, firestore, storage };
