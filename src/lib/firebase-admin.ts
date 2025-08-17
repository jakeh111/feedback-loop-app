
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

interface AdminServices {
  app: App,
  firestore: Firestore;
  storage: Storage;
}

// This is a more robust way to initialize Firebase Admin SDK in a serverless environment like Next.js
// It uses the global object to store the initialized services, preventing re-initialization
// during hot-reloads in development, which is a common cause of the 'INTERNAL' TypeError.
if (!global.firebaseAdmin) {
  try {
    const app = admin.apps.length > 0 ? admin.apps[0]! : admin.initializeApp({
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    global.firebaseAdmin = {
      app,
      firestore: admin.firestore(app),
      storage: admin.storage(app),
    };
  } catch (error) {
    // Catch initialization errors, which can happen if the logic above isn't fullproof
    // during certain hot-reload scenarios.
    if (!/already exists/u.test(error instanceof Error ? error.message : '')) {
      throw error;
    }
    // If it already exists, we can assume the services are on the global object
    // from a previous, successful initialization.
  }
}

export const { firestore, storage } = global.firebaseAdmin as AdminServices;
