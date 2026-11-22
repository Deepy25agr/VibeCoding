import { Router } from "express";
import {
  getAllConversations,
  getConversation,
  createConversation,
  deleteConversation,
  updateTone,
  updateTitle,
  saveMessage,
} from "../controllers/conversationController.js";

const router = Router();

// All routes are prefixed with /api/conversations (set in index.js)

// Thread-level operations (used by the History Sidebar)
router.get("/", getAllConversations); // List all threads
router.post("/", createConversation); // Start a new thread
router.get("/:threadId", getConversation); // Load a specific thread
router.delete("/:threadId", deleteConversation); // Delete a thread
router.patch("/:threadId/tone", updateTone); // Change tone on a thread
router.patch("/:threadId/title", updateTitle); // Rename a thread

// Message-level operation (called after a stream completes to persist text)
router.post("/:threadId/save-message", saveMessage);

export default router;
