import { getScanHistory } from "./src/firebase/firestore.js";

async function testRead() {
  const uid = "test_user_123";
  try {
    const history = await getScanHistory(uid);
    console.log("Successfully read history. Count:", history.length);
  } catch (error) {
    console.error("Read failed:", error);
  }
}

testRead();
