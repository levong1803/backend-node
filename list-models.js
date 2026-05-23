import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
  const models = await client.models.list();
  console.log("Available models:");
  for await (const m of models) {
    if (m.name.includes("embed")) console.log(m.name);
  }
}
list();
