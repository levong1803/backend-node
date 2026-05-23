import { getScanHistory } from "./src/firebase/firestore.js";
import { initFirebase } from "./src/firebase/client.js";
import { config } from "dotenv";
config();

async function test() {
  initFirebase();
  try {
    const res = await getScanHistory("test");
    console.log("Firestore OK:", res.length);
  } catch (e) {
    console.error("Firestore Error:", e);
  }
}
test();
