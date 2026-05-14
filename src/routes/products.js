import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import { getScanHistory } from "../firebase/firestore.js";
import { getAllProducts, recommendForConditions } from "../services/productRecommender.js";

export const productsRouter = express.Router();

productsRouter.get("/", (req, res) => {
  const products = getAllProducts(req.query.category, req.query.skin_type);
  return res.json({ products, total: products.length });
});

productsRouter.get("/recommended", verifyFirebaseToken, async (req, res, next) => {
  try {
    const scanHistory = await getScanHistory(req.user.uid);

    if (!scanHistory.length) {
      const products = getAllProducts();
      return res.json({ products, total: products.length, based_on: "general" });
    }

    const latestScan = scanHistory[0];
    const conditionNames = (latestScan.conditions ?? []).map((condition) => condition.name ?? "");
    const products = recommendForConditions(conditionNames);

    return res.json({
      products,
      total: products.length,
      based_on: "latest_scan",
      scan_score: latestScan.score,
      conditions: conditionNames
    });
  } catch (error) {
    return next(error);
  }
});
