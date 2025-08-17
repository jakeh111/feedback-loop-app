
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This function ensures that we initialize the app only once.
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
const auth = getAuth(app);
const storage = getStorage(app);

// It's important to only connect to emulators on the client side,
// and only in development mode.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Note: You must run the Firebase emulators for this to work.
    // We are currently using the live Firebase services as per our last fix.
    // To re-enable emulators, uncomment these lines.
    // import { connectAuthEmulator } from "firebase/auth";
    // import { connectStorageEmulator } from "firebase/storage";
    // try {
    //   connectAuthEmulator(auth, "http://127.0.0.1:9025");
    //   connectStorageEmulator(storage, "127.0.0.1", 9198);
    // } catch (e) {
    //   console.log("Emulators already connected or error connecting", e);
    // }
}


export { app, auth, storage };
