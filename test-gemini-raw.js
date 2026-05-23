import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
config();

async function test() {
  try {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Hello"
    });
    console.log(response.text);
  } catch (e) {
    console.error("Gemini Error:", e);
  }
}
test();
