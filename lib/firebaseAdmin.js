// lib/firebaseAdmin.js

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";

// Ensure the Admin SDK is initialized only once
if (!admin.apps.length) {
  let serviceAccount;

  console.log("Firebase Admin SDK: Attempting to initialize...");
  console.log(`Firebase Admin SDK: NODE_ENV is: ${process.env.NODE_ENV}`);

  if (process.env.NODE_ENV === "production") {
    const serviceAccountBase64 = process.env.FIREBASE_ADMIN_SDK_JSON;

    if (!serviceAccountBase64) {
      console.error(
        "FIREBASE_ADMIN_SDK_JSON environment variable is not set in production."
      );
      throw new Error(
        "Firebase Admin SDK JSON is missing in production environment."
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
        "Invalid Firebase Admin SDK JSON in environment variable."
      );
    }
  } else {
    // THIS IS THE BLOCK WE ARE TEMPORARILY CHANGING FOR DEBUGGING
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;

    if (!serviceAccountPath) {
      console.error(
        "FIREBASE_ADMIN_SDK_PATH environment variable is not set in development."
      );
      throw new Error(
        "Firebase Admin SDK path is missing in development environment."
      );
    }

    console.log(
      `Firebase Admin SDK: Attempting to load service account from path: ${serviceAccountPath} (THIS LINE SHOULD PRINT!)`
    );
    try {
      // COMMENT OUT THE ORIGINAL LINE BELOW:
      // const absoluteServiceAccountPath = path.resolve(process.cwd(), serviceAccountPath);
      // console.log(`Firebase Admin SDK: Resolved absolute path: ${absoluteServiceAccountPath}`);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      // serviceAccount = require(absoluteServiceAccountPath);
      // console.log("Firebase Admin SDK: Service account file loaded successfully.");

      // ADD THIS DUMMY SERVICE ACCOUNT OBJECT INSTEAD:
      serviceAccount = {
        type: "service_account",
        project_id: "dummy-project-for-testing",
        private_key_id: "a_dummy_key_id",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nYOUR_DUMMY_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n", // Keep structure, content doesn't matter for this test
        client_email: "dummy@dummy-project-for-testing.iam.gserviceaccount.com",
        client_id: "12345678901234567890",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/dummy-sa.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      };
      console.log(
        "Firebase Admin SDK: Using DUMMY service account for testing initialization."
      ); // THIS LINE SHOULD PRINT!
    } catch (e) {
      console.error(
        `Firebase Admin SDK: Failed during DUMMY service account setup:`,
        e
      );
      throw new Error(`Failed to load Firebase Admin SDK file: ${e.message}`);
    }
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK: Initialization successful!"); // THIS LINE SHOULD PRINT IF DUMMY WORKS!
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
