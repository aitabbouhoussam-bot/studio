// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Check if emulators are not already connected to prevent errors on hot reloads
  // @ts-ignore
  if (!auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    } catch (e) {
      console.log('Auth emulator already connected or failed to connect');
    }
  }
  // @ts-ignore
  if (!db._settings.host.includes('localhost')) {
     try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (e) {
      console.log('Firestore emulator already connected or failed to connect');
    }
  }
   // @ts-ignore
  if (!storage.emulator) {
     try {
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (e) {
      console.log('Storage emulator already connected or failed to connect');
    }
  }
  // @ts-ignore
  if (!functions.emulatorOrigin) {
     try {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch (e) {
      console.log('Functions emulator already connected or failed to connect');
    }
  }
}

export { app, auth, db, storage, functions };
