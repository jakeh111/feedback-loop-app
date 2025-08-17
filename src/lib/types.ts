
// Augment the NodeJS global type with our custom property
declare global {
  // eslint-disable-next-line no-var
  var firebaseAdmin: {
    app: import('firebase-admin/app').App,
    firestore: import('firebase-admin/firestore').Firestore,
    storage: import('firebase-admin/storage').Storage,
  } | undefined;
}


export type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  endTimestamp?: number;
  avatarUrl: string;
  youtubeUrl?: string;
  youtubeTimestamp?: number;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  waveform: number[];
};
