
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

// This is a robust way to initialize Firebase Admin SDK in a serverless environment like Next.js
// It uses a global variable to cache the Admin SDK instance, preventing re-initialization during hot-reloads.

declare global {
  var firebaseAdmin: {
    app: App;
    auth: Auth;
    firestore: Firestore;
    storage: Storage;
  } | undefined;
}

if (!global.firebaseAdmin) {
    try {
        const app = admin.initializeApp({
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });

        global.firebaseAdmin = {
            app,
            auth: admin.auth(app),
            firestore: admin.firestore(app),
            storage: admin.storage(app),
        };
    } catch (error: any) {
         if (!/already exists/u.test(error.message)) {
            console.error('Firebase Admin SDK initialization error', error.stack);
         }
    }
}

export const { app, auth, firestore, storage } = global.firebaseAdmin!;

    