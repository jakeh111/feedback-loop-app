
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

// This is the recommended way to initialize the Firebase Admin SDK in a Next.js app.
// It checks if an app is already initialized before attempting to initialize one.

const app = admin.apps.length
  ? admin.apps[0]!
  : admin.initializeApp({
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

const auth = admin.auth(app);
const firestore = admin.firestore(app);
const storage = admin.storage(app);

export { app, auth, firestore, storage };
