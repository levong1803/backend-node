import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";
import { getConfigStatus, settings } from "../config.js";

let initialized = false;

export function initFirebase() {
  if (initialized) {
    return;
  }

  const serviceAccountPath = path.join(settings.projectRoot, settings.firebaseServiceAccount);
  const appOptions = {};

  if (settings.firebaseStorageBucket) {
    appOptions.storageBucket = settings.firebaseStorageBucket;
  }

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
      ...appOptions
    });
  } else {
    admin.initializeApp(appOptions);
  }

  initialized = true;
}

export function getDb() {
  initFirebase();
  return admin.firestore();
}

export function getBucket() {
  initFirebase();
  if (!settings.firebaseStorageBucket) {
    throw new Error("Firebase Storage bucket is not configured. Set FIREBASE_STORAGE_BUCKET in .env.");
  }
  return admin.storage().bucket();
}

export { admin };

export function getFirebaseStatus() {
  const config = getConfigStatus();
  return {
    serviceAccountConfigured: config.firebaseServiceAccountExists,
    storageBucketConfigured: config.firebaseStorageBucketConfigured
  };
}
