import { GoogleGenAI } from "@google/genai";
import { settings } from "../config.js";

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
- Always mention consulting a dermatologist for serious concerns
- Respond in the same language as the user's message
`;

function getGeminiClient() {
  if (!settings.geminiApiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey: settings.geminiApiKey });
}

export async function generateChatResponse(userMessage, scanHistory = []) {
  const latestScan = scanHistory[0];
  const contextParts = [SYSTEM_PROMPT];

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

  if (!settings.geminiApiKey) {
    return "I can help with skincare guidance, but Gemini is not configured yet. Please set GEMINI_API_KEY and consult a dermatologist for medical concerns.";
  }

  const client = getGeminiClient();
  const prompt = `${contextParts.join("\n\n")}\n\nUser's message: ${userMessage}`;
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt
  });

  return (response.text ?? "").trim();
}
