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
  // Using try/catch is a more robust way to handle emulator connections
  // as it avoids relying on private SDK properties that might change.
  try {
    const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
    if (authEmulatorHost) {
      connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
    }
  } catch (e) {
    console.log('Auth emulator may already be connected.');
  }
   try {
    const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST;
    const firestoreEmulatorPort = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT;
    if (firestoreEmulatorHost && firestoreEmulatorPort) {
      connectFirestoreEmulator(db, firestoreEmulatorHost, parseInt(firestoreEmulatorPort, 10));
    }
  } catch (e) {
    console.log('Firestore emulator may already be connected.');
  }
   try {
    const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
    const storageEmulatorPort = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT;
    if (storageEmulatorHost && storageEmulatorPort) {
      connectStorageEmulator(storage, storageEmulatorHost, parseInt(storageEmulatorPort, 10));
    }
  } catch (e) {
    console.log('Storage emulator may already be connected.');
  }
   try {
    const functionsEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
    const functionsEmulatorPort = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT;
    if (functionsEmulatorHost && functionsEmulatorPort) {
      connectFunctionsEmulator(functions, functionsEmulatorHost, parseInt(functionsEmulatorPort, 10));
    }
  } catch (e) {
    console.log('Functions emulator may already be connected.');
  }
}

export { app, auth, db, storage, functions };
