import fs from "fs";
import { uploadImageIfConfigured } from "./src/firebase/storage.js";
import { config } from "dotenv";
config();

async function test() {
  try {
    const buffer = Buffer.from("test");
    const url = await uploadImageIfConfigured(buffer, "image/jpeg");
    console.log("Upload result:", url);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
