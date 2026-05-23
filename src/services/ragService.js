import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { settings } from "../config.js";
import { withKeyRotation, MODELS } from "./geminiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, "../knowledge/skincare-kb.json");
const CACHE_PATH = path.join(__dirname, "../knowledge/embeddings-cache.json");

let knowledgeBase = [];



function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initKnowledgeBase() {
  try {
    const kbData = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
    
    // Check if cache exists
    if (fs.existsSync(CACHE_PATH)) {
      console.log("Loading knowledge base embeddings from cache...");
      knowledgeBase = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
      return;
    }

    console.log("Generating embeddings for knowledge base...");
    if (!settings.geminiApiKey) {
      console.warn("Gemini API key not configured. RAG will not work.");
      // Just load without embeddings
      knowledgeBase = kbData.map(doc => ({ ...doc, embedding: null }));
      return;
    }

    // Embed all docs
    knowledgeBase = [];
    for (const doc of kbData) {
      const textToEmbed = `${doc.title}: ${doc.content}`;
      try {
        const response = await withKeyRotation(async (client) => {
          return await client.models.embedContent({
            model: MODELS.EMBEDDING,
            contents: textToEmbed,
          });
        });
        
        knowledgeBase.push({
          ...doc,
          embedding: response.embeddings[0].values,
        });
        
        // Add a small delay to avoid rate limits if there are many docs
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.error(`Failed to embed document ${doc.id}:`, err.message);
        knowledgeBase.push({ ...doc, embedding: null });
      }
    }

    // Save to cache
    fs.writeFileSync(CACHE_PATH, JSON.stringify(knowledgeBase, null, 2));
    console.log("Knowledge base embeddings generated and cached.");
  } catch (error) {
    console.error("Error initializing knowledge base:", error);
  }
}

export async function retrieveRelevantDocs(query, topK = 3) {
  if (knowledgeBase.length === 0 || !settings.geminiApiKey) {
    return [];
  }

  try {
    const response = await withKeyRotation(async (client) => {
      return await client.models.embedContent({
        model: MODELS.EMBEDDING,
        contents: query,
      });
    });
    
    const queryEmbedding = response.embeddings[0].values;
    
    // Calculate similarities
    const scoredDocs = knowledgeBase
      .filter(doc => doc.embedding !== null)
      .map(doc => ({
        doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding)
      }));
      
    // Sort by descending score
    scoredDocs.sort((a, b) => b.score - a.score);
    
    // Return top K
    return scoredDocs.slice(0, topK).map(item => item.doc);
  } catch (error) {
    console.error("Error retrieving relevant docs:", error);
    return [];
  }
}
