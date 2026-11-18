import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let cachedDb = null;

function getDb() {
  if (cachedDb) return cachedDb;

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Faltan variables de Firebase Admin (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
      );
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  cachedDb = getFirestore();
  return cachedDb;
}

const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const firestore = getDb();
      const value = firestore[prop];
      return typeof value === 'function' ? value.bind(firestore) : value;
    },
  }
);

export { db };