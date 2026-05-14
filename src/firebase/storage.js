import crypto from "node:crypto";
import { getBucket } from "./client.js";

export async function uploadImage(fileBuffer, contentType = "image/jpeg") {
  const bucket = getBucket();
  const filename = `scans/${crypto.randomUUID()}.jpg`;
  const file = bucket.file(filename);

  await file.save(fileBuffer, {
    metadata: { contentType }
  });

  await file.makePublic();
  return file.publicUrl();
}

export async function uploadImageIfConfigured(fileBuffer, contentType = "image/jpeg") {
  try {
    return await uploadImage(fileBuffer, contentType);
  } catch (error) {
    if (error.message.includes("Firebase Storage bucket is not configured")) {
      return null;
    }
    throw error;
  }
}
