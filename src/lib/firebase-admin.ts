
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

interface AdminServices {
  app: App,
  firestore: Firestore;
  storage: Storage;
}

// Using `globalThis` prevents re-initialization during hot-reloads in development.
let adminServices: AdminServices | null = (globalThis as any)._firebaseAdminServices;

const getFirebaseAdmin = (): AdminServices => {
  if (adminServices) {
    return adminServices;
  }

  if (admin.apps.length === 0) {
    try {
      // When running in a Google Cloud environment, the SDK can automatically
      // find the credentials. For local development and other environments,
      // we use a service account key file stored in environment variables.
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (privateKey && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
         admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
              privateKey: privateKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      } else {
        // Fallback for environments where Application Default Credentials are available
        admin.initializeApp({
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      }

    } catch (error) {
       console.error('Firebase Admin initialization error', error);
       throw error;
    }
  }

  const app = admin.app();
  const firestore = admin.firestore(app);
  const storage = admin.storage(app);

  adminServices = { app, firestore, storage };
  (globalThis as any)._firebaseAdminServices = adminServices;

  return adminServices;
};

export const { firestore, storage } = getFirebaseAdmin();
