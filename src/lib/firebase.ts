
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;
let firestore: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
storage = getStorage(app);
firestore = getFirestore(app);

// It's important to only connect to emulators on the client side,
// and only in development mode.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Note: You must run the Firebase emulators for this to work.
    // We are currently using the live Firebase services as per our last fix.
    // To re-enable emulators, uncomment these lines.
    // import { connectAuthEmulator } from "firebase/auth";
    // import { connectStorageEmulator } from "firebase/storage";
    // import { connectFirestoreEmulator } from "firebase/firestore";
    // try {
    //   connectAuthEmulator(auth, "http://127.0.0.1:9025");
    //   connectStorageEmulator(storage, "127.0.0.1", 9198);
    //   connectFirestoreEmulator(firestore, "127.0.0.1", 8090);
    // } catch (e) {
    //   console.log("Emulators already connected or error connecting", e);
    // }
}

export { app, auth, storage, firestore };
