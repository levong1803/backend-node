import cors from "cors";
import express from "express";
import { getConfigStatus } from "./config.js";
import { getFirebaseStatus } from "./firebase/client.js";
import { authRouter } from "./routes/auth.js";
import { chatRouter } from "./routes/chat.js";
import { productsRouter } from "./routes/products.js";
import { scanRouter } from "./routes/scan.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "DermaScan API", version: "1.0.0" });
});

app.get("/health/basic", (_req, res) => {
  res.json({
    status: "ok",
    routes: {
      products: true,
      auth: true,
      scan: true,
      chat: true
    },
    config: {
      ...getConfigStatus(),
      ...getFirebaseStatus()
    },
    notes: {
      storageOptionalForScan: true
    }
  });
});

app.use("/api/auth", authRouter);
app.use("/api/scan", scanRouter);
app.use("/api/chat", chatRouter);
app.use("/api/products", productsRouter);

app.use((error, _req, res, _next) => {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ detail: "Anh qua lon (toi da 10MB)" });
  }

  return res.status(500).json({
    detail: error?.message || "Internal server error"
  });
});
