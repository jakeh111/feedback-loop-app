import * as admin from 'firebase-admin';

// This is a robust way to initialize Firebase Admin SDK in a serverless environment like Next.js
// It ensures that we only initialize the app once.

const getFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // The service account credentials can be automatically discovered
  // if the GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
  // In Firebase Hosting with App Hosting, this is handled automatically.
  try {
    return admin.initializeApp({
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    // If initialization fails, it's often due to missing credentials.
    if (error instanceof Error && 'code' in error && error.code === 'app/invalid-credential') {
        console.error('Firebase Admin initialization failed: Invalid credentials. Make sure your service account is set up correctly.');
    } else {
        console.error('Firebase Admin initialization error', error);
    }
    // Re-throw the error to indicate that the admin services are not available.
    throw error;
  }
};

const app = getFirebaseAdmin();
const firestore = admin.firestore(app);
const storage = admin.storage(app);

export { firestore, storage };
