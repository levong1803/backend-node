import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const BROKEN_PROXY = "http://127.0.0.1:9";
for (const key of ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "GIT_HTTP_PROXY", "GIT_HTTPS_PROXY"]) {
  if ((process.env[key] ?? "").trim() === BROKEN_PROXY) {
    process.env[key] = "";
  }
}

if (!process.env.NO_PROXY) {
  process.env.NO_PROXY = "localhost,127.0.0.1,::1";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export const settings = {
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ?? "firebase-service-account.json",
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "",
  host: process.env.HOST ?? "0.0.0.0",
  port: Number.parseInt(process.env.PORT ?? "8000", 10),
  debug: (process.env.DEBUG ?? "true").toLowerCase() === "true",
  projectRoot
};

export function getConfigStatus() {
  const serviceAccountPath = path.join(projectRoot, settings.firebaseServiceAccount);

  return {
    geminiConfigured: settings.geminiApiKey.length > 0,
    firebaseServiceAccountPath: serviceAccountPath,
    firebaseServiceAccountExists: fs.existsSync(serviceAccountPath),
    firebaseStorageBucketConfigured: settings.firebaseStorageBucket.length > 0,
    host: settings.host,
    port: settings.port
  };
}
