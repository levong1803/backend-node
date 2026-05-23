import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test(modelName) {
  try {
    const res = await client.models.embedContent({
      model: modelName,
      contents: "Hello",
    });
    console.log(`${modelName} works!`, res.embeddings[0].values.slice(0, 3));
  } catch(e) {
    console.error(`${modelName} failed:`, e.message);
  }
}

async function run() {
  await test("text-embedding-004");
  await test("gemini-embedding-2");
}
run();
