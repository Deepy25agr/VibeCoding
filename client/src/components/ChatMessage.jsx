import { useState } from "react";

/**
 * A single chat bubble with distinct visual styling for user vs AI.
 *
 * User messages:
 *   - Right-aligned, blue gradient background, white text
 *   - User avatar (person icon) on the right, sharp bottom-right corner
 *
 * AI messages:
 *   - Left-aligned, white background with border + shadow
 *   - AI avatar (sparkle icon) on the left, sharp bottom-left corner
 *   - Copy button below the bubble (copies full response to clipboard)
 *
 * The streaming view reuses this with isStreaming=true for the accumulating
 * text with a blinking cursor.
 */
export default function ChatMessage({ role, content, isStreaming = false }) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={`flex items-end gap-2.5 mb-5 message-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI avatar — left side */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
            <circle cx="18" cy="18" r="2" />
            <circle cx="6" cy="18" r="2" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col flex-1 min-w-0 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className={`text-xs font-semibold ${isUser ? "text-blue-600" : "text-indigo-500"}`}>
            {isUser ? "You" : "Gemini AI"}
          </span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>

        {/* Message bubble */}
        <div
          className={`w-fit max-w-[75%] px-4 py-3 shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md"
              : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-slate-400 animate-pulse rounded-sm align-middle" />
            )}
          </p>
        </div>

        {/* Copy button — only for AI messages, hidden while streaming */}
        {!isUser && !isStreaming && (
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 mt-1.5 ml-1 text-xs transition-colors ${
              copied ? "text-green-500" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Copy response"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* User avatar — right side */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
      )}
    </div>
  );
}
