import crypto from "node:crypto";
import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import { getChatHistory, getChatMessages, getScanHistory, saveChatMessage } from "../firebase/firestore.js";
import { generateChatResponse } from "../services/chatbotService.js";

export const chatRouter = express.Router();

chatRouter.get("/history", verifyFirebaseToken, async (req, res, next) => {
  try {
    const chats = await getChatHistory(req.user.uid);
    const sorted = chats.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    return res.json({ chats: sorted });
  } catch (error) {
    return next(error);
  }
});

chatRouter.get("/:chatId/messages", verifyFirebaseToken, async (req, res, next) => {
  try {
    const messages = await getChatMessages(req.user.uid, req.params.chatId);
    return res.json({ chatId: req.params.chatId, messages });
  } catch (error) {
    return next(error);
  }
});

chatRouter.post("/message", verifyFirebaseToken, async (req, res, next) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ detail: "message la bat buoc" });
    }

    const uid = req.user.uid;
    const chatId = req.body?.chat_id || crypto.randomUUID().replaceAll("-", "");
    const now = Date.now();
    const scanHistory = await getScanHistory(uid);

    await saveChatMessage(uid, chatId, {
      text: message,
      fromUser: true,
      timestamp: now
    });

    const aiReplyText = await generateChatResponse(message, scanHistory);
    const replyTimestamp = Date.now();

    await saveChatMessage(uid, chatId, {
      text: aiReplyText,
      fromUser: false,
      timestamp: replyTimestamp
    });

    return res.json({
      chat_id: chatId,
      reply: {
        id: crypto.randomUUID().replaceAll("-", ""),
        text: aiReplyText,
        fromUser: false,
        timestamp: replyTimestamp
      }
    });
  } catch (error) {
    return next(error);
  }
});
