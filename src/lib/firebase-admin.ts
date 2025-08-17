
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// This is the recommended way to initialize the Firebase Admin SDK in a Next.js app,
// especially in a development environment with hot-reloading. Using a global variable
// ensures that we don't try to re-initialize the app on every reload.

if (!global.firebaseAdmin) {
  let app: App;
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
  } else {
    // In a deployed environment like App Hosting, the SDK will automatically
    // find the necessary credentials. For local development, we provide the
    // project ID explicitly to ensure a stable connection.
    app = admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  global.firebaseAdmin = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}

export const { app, auth, firestore, storage } = global.firebaseAdmin;
