
import { initializeApp, getApps, getApp, type App, type AppOptions } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { credential } from 'firebase-admin';

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
  if (getApps().length === 0) {
    try {
       const appOptions: AppOptions = {
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      };

      // When running locally or in some CI environments, GOOGLE_APPLICATION_CREDENTIALS might be used.
      // In App Hosting, default credentials are used. We are explicitly defining the service account
      // to ensure the correct one is used.
      if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
        appOptions.credential = credential.applicationDefault();
        appOptions.serviceAccountId = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      }
      
      initializeApp(appOptions);

    } catch (error) {
       if (error instanceof Error && 'code' in error && (error as any).code === 'app/invalid-credential') {
          console.error('Firebase Admin initialization failed: Invalid credentials. Make sure your service account is set up correctly.');
      } else {
          console.error('Firebase Admin initialization error', error);
      }
      throw error;
    }
  }

  const app = getApp();
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  adminServices = { app, firestore, storage };

  return adminServices;
};

export const { firestore, storage } = getFirebaseAdmin();
