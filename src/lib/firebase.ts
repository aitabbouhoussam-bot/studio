// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "mealgenius-sf4j4",
  appId: "1:578652683693:web:c3b161b8bc54755c82b524",
  storageBucket: "mealgenius-sf4j4.firebasestorage.app",
  apiKey: "AIzaSyBvhPgIl4hpXmfvZjOLiyTH_0dMUp7_v1g",
  authDomain: "mealgenius-sf4j4.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "578652683693",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
