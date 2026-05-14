import { GoogleGenAI } from "@google/genai";
import { settings } from "../config.js";

const ANALYSIS_PROMPT = `
You are a dermatology AI assistant. Analyze the provided skin image and return a JSON response with the following structure:

{
  "score": <int 0-100, overall skin health score>,
  "conditions": [
    {
      "name": "<condition name, e.g. Acne, Dark Spots, Fine Lines, Dryness, Redness>",
      "severity": "<Low | Moderate | High>",
      "confidence": <int 0-100>
    }
  ],
  "recommendations": [
    "<actionable skincare recommendation 1>",
    "<actionable skincare recommendation 2>",
    "<actionable skincare recommendation 3>"
  ]
}

Rules:
- Detect at least 2-5 skin conditions
- Score reflects overall skin health (higher = healthier)
- Provide 3-5 practical, specific recommendations
- Be professional but accessible
- Return ONLY valid JSON, no markdown or extra text

IMPORTANT: This is for educational purposes only. Always recommend consulting a dermatologist for medical advice.
`;

const FALLBACK_ANALYSIS = {
  score: 75,
  conditions: [{ name: "General Assessment", severity: "Low", confidence: 70 }],
  recommendations: [
    "Use a gentle cleanser twice daily",
    "Apply sunscreen SPF 30+ every morning",
    "Consult a dermatologist for a detailed assessment"
  ]
};

function stripMarkdownFence(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  const withoutFirstFence = trimmed.slice(3);
  const withoutJsonLabel = withoutFirstFence.startsWith("json") ? withoutFirstFence.slice(4) : withoutFirstFence;
  const closingFenceIndex = withoutJsonLabel.lastIndexOf("```");
  return (closingFenceIndex >= 0 ? withoutJsonLabel.slice(0, closingFenceIndex) : withoutJsonLabel).trim();
}

function getGeminiClient() {
  if (!settings.geminiApiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey: settings.geminiApiKey });
}

export async function analyzeSkinImage(imageBuffer, mimeType = "image/jpeg") {
  const client = getGeminiClient();
  if (!client) {
    return FALLBACK_ANALYSIS;
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: ANALYSIS_PROMPT },
            {
              inlineData: {
                mimeType,
                data: imageBuffer.toString("base64")
              }
            }
          ]
        }
      ]
    });

    const text = stripMarkdownFence(response.text ?? "");
    return JSON.parse(text);
  } catch {
    return FALLBACK_ANALYSIS;
  }
}
