import Conversation from "../models/Conversation.js";
import { generateTitle } from "../services/geminiService.js";

/**
 * GET /api/conversations
 * Returns all threads (id + title + tone + timestamps) for the History Sidebar.
 * We strip messages to keep the list payload small — the sidebar only needs titles.
 */
export const getAllConversations = async (req, res) => {
  try {
    const threads = await Conversation.find()
      .sort({ updatedAt: -1 })
      .select("threadId title tone updatedAt createdAt");
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/conversations/:threadId
 * Returns a single thread with all its messages — used when a user clicks
 * a thread in the History Sidebar to load it into the chat view.
 */
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      threadId: req.params.threadId,
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/conversations
 * Creates a new chat thread with the given tone.
 * Body: { threadId, tone }
 */
export const createConversation = async (req, res) => {
  try {
    const { threadId, tone = "professional" } = req.body;
    const exists = await Conversation.findOne({ threadId });
    if (exists) {
      return res.status(409).json({ error: "Thread already exists" });
    }
    const conversation = await Conversation.create({ threadId, tone });
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/conversations/:threadId
 * Removes a thread from MongoDB + the History Sidebar.
 */
export const deleteConversation = async (req, res) => {
  try {
    const result = await Conversation.findOneAndDelete({
      threadId: req.params.threadId,
    });
    if (!result) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /api/conversations/:threadId/tone
 * Updates the tone for an existing thread.
 * Body: { tone }
 */
export const updateTone = async (req, res) => {
  try {
    const { tone } = req.body;
    const conversation = await Conversation.findOneAndUpdate(
      { threadId: req.params.threadId },
      { tone },
      { new: true }
    );
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /api/conversations/:threadId/title
 * Renames a thread — lets the user edit the auto-generated title.
 * Body: { title }
 */
export const updateTitle = async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.findOneAndUpdate(
      { threadId: req.params.threadId },
      { title },
      { new: true }
    );
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/conversations/:threadId/save-message
 * Saves a completed message pair (user prompt + full AI response) to MongoDB.
 * Also auto-generates a thread title from the first user message.
 * Body: { role, content }
 */
export const saveMessage = async (req, res) => {
  try {
    const { role, content } = req.body;
    const conversation = await Conversation.findOne({
      threadId: req.params.threadId,
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages.push({ role, content });

    // Auto-title the thread using the first user message.
    if (
      role === "user" &&
      conversation.title === "New Chat" &&
      conversation.messages.filter((m) => m.role === "user").length === 1
    ) {
      try {
        conversation.title = await generateTitle(content);
      } catch {
        // If title generation fails, fall back to a truncated message.
        conversation.title = content.slice(0, 30);
      }
    }

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
