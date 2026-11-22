import { GoogleGenAI } from "@google/genai";

// Lazy-initialised client so a missing key doesn't crash server startup.
let client = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/**
 * Retries a function call on 503 (Service Unavailable) errors.
 * Gemini's free tier can return 503 during demand spikes — this makes
 * the app resilient by waiting and trying again before giving up.
 */
const MAX_RETRIES = 3;

async function withRetry(fn, label = "Gemini API") {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isOverloaded =
        error.status === 503 ||
        error.code === 503 ||
        error.message?.includes("503");

      if (isOverloaded && attempt < MAX_RETRIES - 1) {
        const waitMs = (attempt + 1) * 2000; // 2s, 4s, 6s
        console.log(
          `⏳ ${label} busy (503), retrying in ${waitMs / 1000}s... (attempt ${
            attempt + 1
          }/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Maps the user's tone selection to a system instruction that shapes the
 * AI's reply style. This is the core of the "Vibe Check" requirement —
 * the system instruction is passed to every Gemini API request via config.
 */
export const TONE_PROMPTS = {
  professional:
    "You are a professional assistant. Use formal, precise language, complete sentences, and a business-appropriate tone.",
  casual:
    "You are a friendly, casual assistant. Use conversational language, contractions, and a relaxed, warm tone.",
  concise:
    "You are a concise assistant. Keep answers short and to the point. Avoid filler, pleasantries, and unnecessary elaboration.",
};

/**
 * Streams a chat completion from Gemini.
 *
 * Key difference from OpenAI: Gemini uses "model" instead of "assistant"
 * for the AI role, and the system instruction is passed via the config
 * object rather than as a message.
 *
 * Includes automatic retry on 503 (model overloaded) errors.
 *
 * @param {Array} messages — prior conversation [{role, content}, ...]
 * @param {string} tone — "professional" | "casual" | "concise"
 * @returns {AsyncGenerator<string>} yields token chunks as they arrive
 */
export async function* streamChatCompletion(messages, tone = "professional") {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const systemInstruction =
    TONE_PROMPTS[tone] ?? TONE_PROMPTS.professional;

  // Convert our internal message format to Gemini's Content[] format.
  // Gemini uses "model" for AI responses; our schema uses "assistant".
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const stream = await withRetry(
    () =>
      getClient().models.generateContentStream({
        model,
        contents,
        config: { systemInstruction },
      }),
    "Gemini stream"
  );

  for await (const chunk of stream) {
    // Each chunk has a .text property with the generated text segment.
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

/**
 * Non-streaming helper (used for single-shot title generation).
 * Generates a short title from the first user message.
 * Includes automatic retry on 503 errors.
 */
export async function generateTitle(firstMessage) {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const response = await withRetry(
    () =>
      getClient().models.generateContent({
        model,
        contents: firstMessage,
        config: {
          systemInstruction:
            "Generate a 2-4 word title summarising the user's message. Reply with only the title, no quotes.",
          maxOutputTokens: 15,
        },
      }),
    "Gemini title"
  );
  return response.text.trim();
}
