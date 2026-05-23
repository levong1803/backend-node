import express from "express";
import multer from "multer";
import { verifyFirebaseToken } from "../middleware/auth.js";
import { getScanById, getScanHistory, saveScan, deleteScan } from "../firebase/firestore.js";
import { uploadImageIfConfigured } from "../firebase/storage.js";
import { analyzeSkinImage } from "../services/skinAnalyzer.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export const scanRouter = express.Router();

scanRouter.post("/analyze", verifyFirebaseToken, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "File la bat buoc" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ detail: "File phai la anh (image/*)" });
    }

    const uid = req.user.uid;
    const imageUrl = await uploadImageIfConfigured(req.file.buffer, req.file.mimetype);
    const analysis = await analyzeSkinImage(req.file.buffer, req.file.mimetype);
    const now = Date.now();

    const scanData = {
      dateMillis: now,
      imageUrl,
      type: "Facial Skin Analysis",
      score: analysis.score,
      skinAge: analysis.skinAge ?? null,
      skinType: analysis.skinType ?? null,
      isFallback: analysis.isFallback === true,
      fallbackReason: analysis.fallbackReason ?? null,
      detailedMetrics: analysis.detailedMetrics ?? null,
      conditions: analysis.conditions ?? [],
      recommendations: analysis.recommendations ?? []
    };

    try {
      const scanId = await saveScan(uid, scanData);
      return res.json({ ...scanData, id: scanId });
    } catch (dbError) {
      console.error("Firestore saveScan failed:", dbError.message);
      return res.status(503).json({
        detail: "Khong the luu ket qua scan. Vui long thu lai sau.",
        code: "SCAN_SAVE_FAILED"
      });
    }
  } catch (error) {
    return next(error);
  }
});

scanRouter.get("/history", verifyFirebaseToken, async (req, res, next) => {
  try {
    const scans = await getScanHistory(req.user.uid);
    return res.json({ scans, total: scans.length });
  } catch (error) {
    return next(error);
  }
});

scanRouter.get("/:scanId", verifyFirebaseToken, async (req, res, next) => {
  try {
    const scan = await getScanById(req.user.uid, req.params.scanId);

    if (!scan) {
      return res.status(404).json({ detail: "Scan khong ton tai" });
    }

    return res.json(scan);
  } catch (error) {
    return next(error);
  }
});

scanRouter.delete("/:scanId", verifyFirebaseToken, async (req, res, next) => {
  try {
    const scan = await getScanById(req.user.uid, req.params.scanId);
    if (!scan) {
      return res.status(404).json({ detail: "Scan khong ton tai" });
    }
    await deleteScan(req.user.uid, req.params.scanId);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});
