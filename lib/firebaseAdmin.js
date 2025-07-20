// lib/firebaseAdmin.js

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
// path module is no longer needed since we are not loading from file path
// import path from "path";

// Ensure the Admin SDK is initialized only once
if (!admin.apps.length) {
  let serviceAccount;

  console.log("Firebase Admin SDK: Attempting to initialize...");
  console.log(`Firebase Admin SDK: NODE_ENV is: ${process.env.NODE_ENV}`);

  const serviceAccountBase64 = process.env.FIREBASE_ADMIN_SDK_JSON;

  if (!serviceAccountBase64) {
    console.error("FIREBASE_ADMIN_SDK_JSON environment variable is not set.");
    throw new Error(
      "Firebase Admin SDK JSON is missing in environment variable. Please set FIREBASE_ADMIN_SDK_JSON."
    );
  }
  try {
    serviceAccount = JSON.parse(
      Buffer.from(serviceAccountBase64, "base64").toString("utf8")
    );
    console.log(
      "Firebase Admin SDK: Service account JSON parsed from Base64 successfully."
    );
  } catch (e) {
    console.error(
      "Firebase Admin SDK: Failed to parse FIREBASE_ADMIN_SDK_JSON:",
      e
    );
    throw new Error(
      "Invalid Firebase Admin SDK JSON in environment variable." + e.message
    );
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK: Initialization successful!");
  } catch (e) {
    console.error("Firebase Admin SDK: Error during admin.initializeApp():", e);
    throw e;
  }
} else {
  console.log(
    "Firebase Admin SDK: Already initialized, skipping initialization."
  );
}

const adminDb = getFirestore();
export { adminDb };
