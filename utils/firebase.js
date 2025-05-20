// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

console.log("=== FIREBASE INITIALIZATION STARTED ===");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Firebase Config Available:", !!firebaseConfig.apiKey);
console.log("Firebase Project ID:", firebaseConfig.projectId || "MISSING");
console.log("Apps already initialized:", getApps().length);

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
console.log("Firebase app initialized:", !!app);

export const db = getFirestore(app);
console.log("Firestore database initialized:", !!db);
console.log("=== FIREBASE INITIALIZATION COMPLETED ===");
