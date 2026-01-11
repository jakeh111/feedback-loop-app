
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";


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
let appCheck: AppCheck | undefined;

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  storage = getStorage(app);
  firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY) {
      appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true
      });
  } else {
    console.warn("Firebase App Check is not initialized. NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY is missing.");
  }

} else {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    storage = getStorage(app);
    firestore = getFirestore(app);
}


export { app, auth, storage, firestore, appCheck };
