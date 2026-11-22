import Conversation from "../models/Conversation.js";
import { streamChatCompletion } from "../services/geminiService.js";

/**
 * Sets up Socket.IO event handlers.
 *
 * The streaming flow (the heart of the app):
 *   1. Client emits "chat:send"  { threadId, message, tone }
 *   2. We save the user message to MongoDB
 *   3. We call Gemini API with streaming enabled and the tone-based system instruction
 *   4. Each token chunk is emitted back via "chat:token"  →  appears char-by-char in UI
 *   5. On completion we emit "chat:done"  { threadId, fullResponse }
 *
 * Error handling: if anything fails, we emit "chat:error" so the UI can react.
 */
export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("chat:send", async ({ threadId, message, tone }) => {
      try {
        // --- Save the user's message ---
        const conversation = await Conversation.findOne({ threadId });
        if (!conversation) {
          return socket.emit("chat:error", {
            threadId,
            error: "Conversation not found",
          });
        }

        conversation.messages.push({ role: "user", content: message });
        await conversation.save();

        // --- Build the message history for the API ---
        const history = conversation.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // --- Stream the AI response token by token ---
        let fullResponse = "";
        const stream = streamChatCompletion(history, tone || conversation.tone);

        for await (const token of stream) {
          fullResponse += token;
          // Emit each chunk immediately → the UI shows it as it arrives
          socket.emit("chat:token", { threadId, token });
        }

        // --- Persist the full assistant response ---
        conversation.messages.push({ role: "assistant", content: fullResponse });
        await conversation.save();

        // --- Tell the client the stream is done ---
        socket.emit("chat:done", { threadId, fullResponse });
      } catch (error) {
        console.error("Stream error:", error.message);
        socket.emit("chat:error", {
          threadId,
          error: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
