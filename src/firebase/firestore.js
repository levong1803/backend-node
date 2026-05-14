import { admin, getDb } from "./client.js";

export async function saveScan(uid, scanData) {
  const db = getDb();
  const docRef = db.collection("users").doc(uid).collection("scans").doc();
  const payload = { ...scanData, id: docRef.id };
  await docRef.set(payload);
  return docRef.id;
}

export async function getScanHistory(uid) {
  const db = getDb();
  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("scans")
    .orderBy("dateMillis", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
}

export async function getScanById(uid, scanId) {
  const db = getDb();
  const doc = await db.collection("users").doc(uid).collection("scans").doc(scanId).get();
  return doc.exists ? doc.data() : null;
}

export async function saveChatMessage(uid, chatId, message) {
  const db = getDb();
  await db.collection("users").doc(uid).collection("chats").doc(chatId).set(
    {
      messages: admin.firestore.FieldValue.arrayUnion(message)
    },
    { merge: true }
  );
}

export async function getUserProfile(uid) {
  const db = getDb();
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
}

export async function updateUserProfile(uid, data) {
  const db = getDb();
  await db.collection("users").doc(uid).set(data, { merge: true });
}

export async function getChatHistory(uid) {
  const db = getDb();
  const snapshot = await db.collection("users").doc(uid).collection("chats").get();
  return snapshot.docs.map((doc) => ({
    chatId: doc.id,
    messages: doc.data().messages ?? [],
    lastTimestamp: (doc.data().messages ?? []).at(-1)?.timestamp ?? 0,
  }));
}

export async function getChatMessages(uid, chatId) {
  const db = getDb();
  const doc = await db.collection("users").doc(uid).collection("chats").doc(chatId).get();
  return doc.exists ? (doc.data().messages ?? []) : [];
}
