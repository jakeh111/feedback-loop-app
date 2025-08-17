
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

// This is a robust way to initialize Firebase Admin SDK in a serverless environment like Next.js
// It ensures that we only initialize the app once.

interface AdminServices {
  app: App,
  firestore: Firestore;
  storage: Storage;
}

// A global variable to hold the initialized services.
// Using `globalThis` prevents re-initialization during hot-reloads in development.
let adminServices: AdminServices | null = null;

const getFirebaseAdmin = (): AdminServices => {
  if (adminServices) {
    return adminServices;
  }

  // The service account credentials can be automatically discovered
  // if the GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
  // In Firebase Hosting with App Hosting, this is handled automatically.
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
       if (error instanceof Error && 'code' in error && error.code === 'app/invalid-credential') {
          console.error('Firebase Admin initialization failed: Invalid credentials. Make sure your service account is set up correctly.');
      } else {
          console.error('Firebase Admin initialization error', error);
      }
      throw error;
    }
  }

  const app = admin.app();
  const firestore = admin.firestore(app);
  const storage = admin.storage(app);

  adminServices = { app, firestore, storage };

  return adminServices;
};

export const { firestore, storage } = getFirebaseAdmin();
