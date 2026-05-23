import crypto from "node:crypto";
import { getBucket } from "./client.js";

export async function uploadImage(fileBuffer, contentType = "image/jpeg") {
  // Prefer ImgBB when configured; otherwise use Firebase Storage.
  if (process.env.IMGBB_API_KEY) {
    try {
      const body = new URLSearchParams();
      body.append("image", fileBuffer.toString("base64"));

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
        method: "POST",
        body
      });

      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
      console.error("ImgBB upload failed:", data);
    } catch (error) {
      console.error("ImgBB connection error:", error);
    }
  }

  const bucket = getBucket();
  if (!bucket) throw new Error("Firebase Storage bucket is not configured");

  const extension = contentType === "image/png" ? "png" : "jpg";
  const filename = `scans/${crypto.randomUUID()}.${extension}`;
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
    if (
      error.message.includes("Firebase Storage bucket is not configured") ||
      error.message.includes("does not have storage enabled")
    ) {
      return null;
    }

    console.warn("Storage upload failed, returning null image:", error.message);
    return null;
  }
}
