import { settings } from "../config.js";
import { withKeyRotation, MODELS } from "./geminiClient.js";

const ANALYSIS_PROMPT = `
You are a dermatology AI assistant. Analyze the provided skin image and return a JSON response with the following structure:

{
  "score": <int 0-100, overall skin health score>,
  "skinAge": <int, estimated skin age>,
  "skinType": "<Oily | Dry | Combination | Sensitive | Normal>",
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
  ],
  "detailedMetrics": {
    "acne": <int 0-100, where 100 means no acne>,
    "wrinkles": <int 0-100, where 100 means no wrinkles>,
    "hydration": <int 0-100, where 100 is perfectly hydrated>,
    "texture": <int 0-100, where 100 is perfectly smooth>,
    "pores": <int 0-100, where 100 means tight/invisible pores>,
    "spots": <int 0-100, where 100 means no dark spots>
  }
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
  skinAge: 25,
  skinType: "Combination",
  isFallback: true,
  conditions: [{ name: "General Assessment", severity: "Low", confidence: 70 }],
  recommendations: [
    "Use a gentle cleanser twice daily",
    "Apply sunscreen SPF 30+ every morning",
    "Consult a dermatologist for a detailed assessment"
  ],
  detailedMetrics: {
    acne: 80,
    wrinkles: 85,
    hydration: 70,
    texture: 75,
    pores: 65,
    spots: 80
  }
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



function normalizeAnalysis(analysis) {
  return {
    score: Number.isInteger(analysis.score) ? Math.min(100, Math.max(0, analysis.score)) : FALLBACK_ANALYSIS.score,
    skinAge: Number.isInteger(analysis.skinAge) ? analysis.skinAge : FALLBACK_ANALYSIS.skinAge,
    skinType: typeof analysis.skinType === "string" ? analysis.skinType : FALLBACK_ANALYSIS.skinType,
    isFallback: false,
    conditions: Array.isArray(analysis.conditions) ? analysis.conditions : FALLBACK_ANALYSIS.conditions,
    recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : FALLBACK_ANALYSIS.recommendations,
    detailedMetrics:
      analysis.detailedMetrics && typeof analysis.detailedMetrics === "object"
        ? analysis.detailedMetrics
        : FALLBACK_ANALYSIS.detailedMetrics
  };
}

export async function analyzeSkinImage(imageBuffer, mimeType = "image/jpeg") {
  if (!settings.geminiApiKey) {
    console.warn("Gemini API key is not configured. Returning fallback skin analysis.");
    return { ...FALLBACK_ANALYSIS, fallbackReason: "gemini_not_configured" };
  }

  try {
    const text = await withKeyRotation(async (client) => {
      const response = await client.models.generateContent({
        model: MODELS.FLASH,
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
      return stripMarkdownFence(response.text ?? "");
    });
    return normalizeAnalysis(JSON.parse(text));
  } catch (error) {
    console.error("Skin analysis failed. Returning fallback analysis:", error.message);
    return { ...FALLBACK_ANALYSIS, fallbackReason: "analysis_failed" };
  }
}
