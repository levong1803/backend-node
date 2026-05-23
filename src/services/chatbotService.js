import { retrieveRelevantDocs } from "./ragService.js";
import { withKeyRotation, MODELS } from "./geminiClient.js";

const SYSTEM_PROMPT = `
You are DermaScan AI Assistant, a friendly, professional skincare advisor.

Your capabilities:
- Answer skincare questions based on the user's scan history
- Provide personalized skincare routines
- Explain skin conditions in simple terms
- Suggest products and ingredients
- Give lifestyle tips for better skin health

Rules:
- Be concise (2-4 sentences unless the user asks for detail)
- Use the user's scan data to personalize responses when available
- Use the provided Skincare Knowledge Base to answer accurately
- Cite specific information from the knowledge base when relevant
- Combine knowledge base info with user's scan data for personalized advice
- Always mention consulting a dermatologist for serious concerns
- Respond in the same language as the user's message
`;

export async function generateChatResponse(userMessage, scanHistory = [], chatHistory = []) {
  const latestScan = scanHistory[0];
  const contextParts = [SYSTEM_PROMPT];

  const relevantDocs = await retrieveRelevantDocs(userMessage, 3);
  if (relevantDocs.length > 0) {
    const knowledgeContext = relevantDocs
      .map((doc) => `[${doc.title}]: ${doc.content}`)
      .join("\n\n");
    contextParts.push(`\nSkincare Knowledge Base:\n${knowledgeContext}\n`);
  }

  if (latestScan) {
    const conditions = (latestScan.conditions ?? [])
      .map((condition) => `${condition.name} (${condition.severity})`)
      .join(", ");
    const recommendations = (latestScan.recommendations ?? []).join(", ");

    contextParts.push(`
User's latest skin scan data:
- Skin Health Score: ${latestScan.score ?? "N/A"}/100
- Conditions detected: ${conditions}
- Previous recommendations: ${recommendations}
`);
  }

  if (chatHistory && chatHistory.length > 0) {
    const historyText = chatHistory
      .slice(-10) // Keep last 10 messages
      .map(msg => `${msg.fromUser ? 'User' : 'Assistant'}: ${msg.text}`)
      .join("\n");
    contextParts.push(`\nRecent Conversation History:\n${historyText}\n`);
  }

  const prompt = `${contextParts.join("\n\n")}\n\nUser's message: ${userMessage}`;

  try {
    return await withKeyRotation(async (client) => {
      const response = await client.models.generateContent({
        model: MODELS.FLASH,
        contents: prompt
      });
      return (response.text ?? "").trim();
    });
  } catch (error) {
    console.error("Gemini API Error in Chat:", error.message);
    return "Xin lỗi, hiện tại hệ thống AI đang quá tải hoặc hết lượt sử dụng (Quota Exceeded). Vui lòng thử lại sau hoặc cập nhật API Key mới!";
  }
}
