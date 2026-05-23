import { GoogleGenAI } from "@google/genai";

const keys = [
  "AIzaSyAXG5YxcH1qWjgHYMZmR6NRq6DZbP_PvoI"
];

async function testKeys() {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    console.log(`\nTesting Key ${i + 1}: ${key.substring(0, 15)}...`);
    
    try {
      const client = new GoogleGenAI({ apiKey: key });
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Hello, reply with just 'OK'"
      });
      console.log(`✅ Key ${i + 1} SUCCESS! Response: ${response.text.trim()}`);
    } catch (error) {
      console.error(`❌ Key ${i + 1} FAILED! Error: ${error.message}`);
    }
  }
}

testKeys();
