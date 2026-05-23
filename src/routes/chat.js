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
    let scanHistory = [];
    try {
      scanHistory = await getScanHistory(uid);
    } catch (e) {
      console.warn("Could not get scan history:", e.message);
    }

    const userMessage = {
      id: crypto.randomUUID().replaceAll("-", ""),
      text: message,
      fromUser: true,
      timestamp: now
    };

    try {
      await saveChatMessage(uid, chatId, userMessage);
    } catch (e) {
      console.warn("Could not save user message:", e.message);
    }

    let existingMessages = [];
    try {
      existingMessages = await getChatMessages(uid, chatId);
    } catch (e) {
      console.warn("Could not get chat history:", e.message);
    }

    const aiReplyText = await generateChatResponse(message, scanHistory, existingMessages);
    const replyTimestamp = Date.now();
    const aiMessage = {
      id: crypto.randomUUID().replaceAll("-", ""),
      text: aiReplyText,
      fromUser: false,
      timestamp: replyTimestamp
    };

    try {
      await saveChatMessage(uid, chatId, aiMessage);
    } catch (e) {
      console.warn("Could not save AI message:", e.message);
    }

    return res.json({
      chat_id: chatId,
      reply: aiMessage
    });
  } catch (error) {
    return next(error);
  }
});
