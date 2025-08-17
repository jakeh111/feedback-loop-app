
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

interface AdminServices {
  app: App,
  firestore: Firestore;
  storage: Storage;
}

// This is a robust way to initialize Firebase Admin SDK in a serverless environment like Next.js
// It prevents re-initialization during hot-reloads in development.
const getFirebaseAdmin = (): AdminServices => {
  const existingApp = admin.apps.find((app) => app?.name === 'DEFAULT');

  if (existingApp) {
    return {
      app: existingApp,
      firestore: admin.firestore(existingApp),
      storage: admin.storage(existingApp),
    };
  }

  const app = admin.initializeApp({
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return {
    app,
    firestore: admin.firestore(app),
    storage: admin.storage(app),
  };
};

export const { firestore, storage } = getFirebaseAdmin();
