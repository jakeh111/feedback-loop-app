
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: admin.app.App;

// This pattern is crucial to prevent re-initializing the SDK in the
// Next.js hot-reloading development environment.
if (admin.apps.length === 0) {
  // In a deployed environment like App Hosting, the SDK will automatically
  // find the necessary credentials. Calling initializeApp() without arguments
  // is the standard approach.
  app = admin.initializeApp();
} else {
  app = admin.apps[0]!;
}

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
