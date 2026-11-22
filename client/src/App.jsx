import { useState, useEffect, useCallback } from "react";
import HistorySidebar from "./components/HistorySidebar.jsx";
import ChatInterface from "./components/ChatInterface.jsx";
import { api } from "./services/apiService.js";
import { connectSocket, disconnectSocket } from "./services/socketService.js";

/**
 * App — top-level state owner.
 *
 * State managed here:
 *  - conversations[]   : thread list for the History Sidebar (from REST API)
 *  - activeThreadId     : which thread is open in the chat view
 *  - messages[]         : messages for the active thread (loaded via REST)
 *  - tone               : current tone selection (persists to backend per thread)
 *
 * The two data paths:
 *   REST API   → thread list + loading a thread's messages (persistence)
 *   Socket.IO  → streaming the AI response in real time
 */
export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tone, setTone] = useState("professional");

  // --- Load the thread list on mount + connect socket ---
  useEffect(() => {
    connectSocket();
    refreshConversations();

    return () => disconnectSocket();
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const data = await api.getAllConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  // --- Selecting a thread loads its messages ---
  const handleSelectThread = async (threadId) => {
    try {
      const conv = await api.getConversation(threadId);
      setActiveThreadId(threadId);
      setTone(conv.tone || "professional");
      setMessages(conv.messages || []);
    } catch (err) {
      console.error("Failed to load thread:", err);
    }
  };

  // --- Creating a new chat thread ---
  const handleNewChat = async () => {
    const threadId = crypto.randomUUID();
    try {
      await api.createConversation(threadId, tone);
      setActiveThreadId(threadId);
      setMessages([]);
      // Add the new thread to the sidebar immediately.
      setConversations((prev) => [
        {
          threadId,
          title: "New Chat",
          tone,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  // --- Deleting a thread ---
  const handleDeleteThread = async (threadId) => {
    try {
      await api.deleteConversation(threadId);
      setConversations((prev) =>
        prev.filter((c) => c.threadId !== threadId)
      );
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // --- Renaming a thread ---
  // Updates the title in the backend and the local sidebar list.
  const handleRename = async (threadId, newTitle) => {
    try {
      await api.updateTitle(threadId, newTitle);
      setConversations((prev) =>
        prev.map((c) =>
          c.threadId === threadId ? { ...c, title: newTitle } : c
        )
      );
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  // --- Changing the tone ---
  // Persists to the backend so the next AI reply uses the new system instruction.
  const handleToneChange = async (newTone) => {
    setTone(newTone);
    if (activeThreadId) {
      try {
        await api.updateTone(activeThreadId, newTone);
      } catch (err) {
        console.error("Failed to update tone:", err);
      }
    }
  };

  // --- When the user sends a message ---
  // Add it to the local messages array so it appears in the chat immediately.
  const handleSendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
  }, []);

  // --- After a streaming response finishes ---
  // Add the assistant message locally + refresh the sidebar (title may have changed).
  const handleStreamDone = useCallback(
    (fullResponse) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullResponse },
      ]);
      refreshConversations();
    },
    [refreshConversations]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <HistorySidebar
        conversations={conversations}
        activeThreadId={activeThreadId}
        onSelect={handleSelectThread}
        onDelete={handleDeleteThread}
        onNewChat={handleNewChat}
        onRename={handleRename}
      />
      <ChatInterface
        threadId={activeThreadId}
        messages={messages}
        tone={tone}
        onToneChange={handleToneChange}
        onSendMessage={handleSendMessage}
        onStreamDone={handleStreamDone}
      />
    </div>
  );
}
