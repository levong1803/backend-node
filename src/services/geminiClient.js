import { GoogleGenAI } from "@google/genai";
import { settings } from "../config.js";

/**
 * Singleton Gemini client with automatic key rotation.
 *
 * Supports multiple comma-separated API keys in GEMINI_API_KEY env var.
 * When a key hits quota (429) or is suspended (403), rotates to the next one.
 */

export const MODELS = {
  FLASH: "gemini-2.5-flash",
  EMBEDDING: "gemini-embedding-2",
};

const allKeys = (settings.geminiApiKey ?? "")
  .split(",")
  .map((k) => k.trim())
  .filter((k) => k.length > 0);

let currentKeyIndex = 0;
let clientInstance = null;

function createClient(apiKey) {
  return new GoogleGenAI({ apiKey });
}

export function getGeminiClient() {
  if (allKeys.length === 0) return null;
  if (!clientInstance) {
    clientInstance = createClient(allKeys[currentKeyIndex]);
  }
  return clientInstance;
}

export function getCurrentKeyIndex() {
  return currentKeyIndex;
}

export function getTotalKeys() {
  return allKeys.length;
}

/**
 * Rotate to the next API key. Returns true if a new key is available,
 * false if all keys have been tried.
 */
export function rotateKey() {
  if (allKeys.length <= 1) return false;
  const startIndex = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % allKeys.length;
  clientInstance = createClient(allKeys[currentKeyIndex]);
  console.log(`Gemini key rotated: index ${startIndex} -> ${currentKeyIndex} (of ${allKeys.length})`);
  return currentKeyIndex !== startIndex;
}

/**
 * Check if an error is a quota/rate limit or permission/suspended error
 * that warrants key rotation.
 */
export function isKeyError(error) {
  const msg = error?.message ?? "";
  return msg.includes("429") || msg.includes("quota") || msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("suspended");
}

/**
 * Execute a function with automatic key rotation on quota/permission errors.
 * Tries all available keys before giving up.
 */
export async function withKeyRotation(fn) {
  let lastError = null;
  const triedKeys = new Set();

  while (triedKeys.size < allKeys.length) {
    triedKeys.add(currentKeyIndex);
    const client = getGeminiClient();
    if (!client) throw new Error("Gemini API key is not configured");

    try {
      return await fn(client);
    } catch (error) {
      lastError = error;
      if (isKeyError(error) && allKeys.length > 1) {
        console.warn(`Key [${currentKeyIndex}] failed: ${error.message?.slice(0, 80)}`);
        rotateKey();
        if (triedKeys.has(currentKeyIndex)) {
          // All keys tried
          break;
        }
      } else {
        throw error; // Non-key error, don't retry
      }
    }
  }

  throw lastError; // All keys exhausted
}
