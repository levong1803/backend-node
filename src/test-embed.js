import { GoogleGenAI } from "@google/genai";
import { settings } from "./config.js";

const client = new GoogleGenAI({ apiKey: settings.geminiApiKey });

async function test() {
  try {
    const res = await client.models.embedContent({
      model: "text-embedding-004",
      contents: "Hello",
    });
    console.log("text-embedding-004 works!", res.embeddings[0].values.slice(0, 3));
  } catch(e) {
    console.error("text-embedding-004 failed:", e.message);
  }
}

test();
