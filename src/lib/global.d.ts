
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

declare global {
  // eslint-disable-next-line no-var
  var firebaseAdmin: {
    app: App;
    auth: Auth;
    firestore: Firestore;
    storage: Storage;
  } | undefined;
}

export {};
