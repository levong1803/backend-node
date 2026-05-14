import { app } from "./app.js";
import { getConfigStatus, settings } from "./config.js";

const configStatus = getConfigStatus();

app.listen(settings.port, settings.host, () => {
  console.log(`DermaScan Node API running at http://${settings.host}:${settings.port}`);
  if (!configStatus.firebaseServiceAccountExists) {
    console.warn(`Firebase service account not found at ${configStatus.firebaseServiceAccountPath}`);
  }
  if (!configStatus.firebaseStorageBucketConfigured) {
    console.warn("FIREBASE_STORAGE_BUCKET is not configured. Scan image upload will fail.");
  }
});
