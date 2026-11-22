/**
 * REST API client for conversation CRUD operations.
 * These calls manage threads and history — NOT the streaming, which goes
 * over Socket.IO. Keeping REST and Socket.IO separate follows the
 * separation of concerns: REST = persistence, Socket.IO = real-time.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/conversations";

export const api = {
  /** List all threads for the History Sidebar. */
  async getAllConversations() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },

  /** Load a full thread with all its messages. */
  async getConversation(threadId) {
    const res = await fetch(`${API_URL}/${threadId}`);
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return res.json();
  },

  /** Create a new thread. */
  async createConversation(threadId, tone = "professional") {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, tone }),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    return res.json();
  },

  /** Delete a thread. */
  async deleteConversation(threadId) {
    const res = await fetch(`${API_URL}/${threadId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete conversation");
    return res.json();
  },

  /** Update the tone for a thread. */
  async updateTone(threadId, tone) {
    const res = await fetch(`${API_URL}/${threadId}/tone`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tone }),
    });
    if (!res.ok) throw new Error("Failed to update tone");
    return res.json();
  },

  /** Rename a thread. */
  async updateTitle(threadId, title) {
    const res = await fetch(`${API_URL}/${threadId}/title`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to rename conversation");
    return res.json();
  },
};
