import { useState, useEffect, useRef } from "react";
import { getSocket } from "../services/socketService.js";
import ChatMessage from "./ChatMessage.jsx";
import ToneToggle from "./ToneToggle.jsx";

/**
 * ChatInterface — the main conversation view.
 *
 * Props:
 *   threadId        — active thread (null = no thread selected)
 *   messages        — array of { role, content } from the API
 *   tone            — current tone
 *   onToneChange    — callback when tone changes
 *   onSendMessage   — callback to display the user's message immediately
 *   onStreamDone    — callback after a response finishes
 */
const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a short haiku about coding",
  "Give me a 5-minute workout plan",
  "What are some tips for better sleep?",
];

export default function ChatInterface({
  threadId,
  messages,
  tone,
  onToneChange,
  onSendMessage,
  onStreamDone,
}) {
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // --- Socket.IO listeners for the streaming flow ---
  useEffect(() => {
    const socket = getSocket();

    const handleToken = ({ threadId: tid, token }) => {
      if (tid === threadId) {
        setWaitingForResponse(false); // First token arrived — stop showing typing dots
        setStreamingText((prev) => prev + token);
      }
    };

    const handleDone = ({ threadId: tid, fullResponse }) => {
      if (tid === threadId) {
        setStreamingText("");
        setIsStreaming(false);
        setWaitingForResponse(false);
        onStreamDone(fullResponse);
      }
    };

    const handleError = ({ threadId: tid, error: err }) => {
      if (tid === threadId) {
        setIsStreaming(false);
        setWaitingForResponse(false);
        setStreamingText("");
        setError(err || "Something went wrong. Please try again.");
      }
    };

    socket.on("chat:token", handleToken);
    socket.on("chat:done", handleDone);
    socket.on("chat:error", handleError);

    return () => {
      socket.off("chat:token", handleToken);
      socket.off("chat:done", handleDone);
      socket.off("chat:error", handleError);
    };
  }, [threadId, onStreamDone]);

  // --- Auto-scroll to the latest message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, waitingForResponse]);

  // --- Send a message ---
  const handleSend = (text) => {
    const message = (text ?? input).trim();
    if (!message || !threadId || isStreaming) return;

    setError("");
    setIsStreaming(true);
    setWaitingForResponse(true); // Show typing indicator until first token
    setStreamingText("");

    onSendMessage(message);

    const socket = getSocket();
    socket.emit("chat:send", { threadId, message, tone });

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Empty state (no thread selected) ---
  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center px-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
              <circle cx="18" cy="18" r="2" />
              <circle cx="6" cy="18" r="2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">
            AI Chat Assistant
          </h2>
          <p className="text-slate-400 mb-1">
            Powered by Gemini · Streamed in real time
          </p>
          <p className="text-slate-400 text-sm">
            Click <span className="font-semibold text-slate-600">New Chat</span> to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              AI Chat Assistant
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-slate-400">Online · Gemini 3.5</span>
            </div>
          </div>
        </div>
        <ToneToggle tone={tone} onChange={onToneChange} />
      </header>

      {/* Scrollable conversation view */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-200">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium mb-6">
              How can I help you today?
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="text-sm text-slate-600 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-4 py-2 rounded-full transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing messages */}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {/* Typing indicator — shown while waiting for the first token */}
        {waitingForResponse && (
          <div className="flex items-end gap-2.5 mb-5 message-fade-in">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                <circle cx="18" cy="18" r="2" />
                <circle cx="6" cy="18" r="2" />
              </svg>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <span className="typing-dot w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="typing-dot w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="typing-dot w-2 h-2 rounded-full bg-slate-400"></span>
              </div>
            </div>
          </div>
        )}

        {/* Live streaming bubble — grows as tokens arrive */}
        {isStreaming && !waitingForResponse && (
          <ChatMessage role="assistant" content={streamingText} isStreaming />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-6 py-2.5 bg-red-50 text-red-600 text-sm text-center border-t border-red-100">
          {error}
        </div>
      )}

      {/* Input bar */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? "AI is responding..." : "Type your message..."}
              disabled={isStreaming}
              rows="1"
              className="w-full resize-none border border-slate-300 rounded-2xl pl-5 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-sm disabled:bg-slate-100 disabled:text-slate-400 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-medium p-3 rounded-2xl transition-all shadow-sm hover:shadow-md"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-xs">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-xs">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
