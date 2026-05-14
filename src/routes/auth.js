import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import { getUserProfile, updateUserProfile } from "../firebase/firestore.js";

export const authRouter = express.Router();

authRouter.get("/me", verifyFirebaseToken, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    let profile = await getUserProfile(uid);

    if (!profile) {
      profile = {
        uid,
        name: req.user.name ?? "",
        email: req.user.email ?? ""
      };
      await updateUserProfile(uid, profile);
    }

    return res.json({ ...profile, uid });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/profile", verifyFirebaseToken, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const allowedFields = ["name", "skinType", "settings"];
    const updateData = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
    );

    await updateUserProfile(uid, updateData);
    const profile = await getUserProfile(uid);
    return res.json({ ...profile, uid });
  } catch (error) {
    return next(error);
  }
});
