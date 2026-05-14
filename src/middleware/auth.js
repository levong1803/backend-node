import { admin, initFirebase } from "../firebase/client.js";

initFirebase();

export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing Bearer token" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ detail: `Loi xac thuc: ${error.message}` });
  }
}
