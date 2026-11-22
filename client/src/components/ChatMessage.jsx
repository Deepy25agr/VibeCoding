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
 *
 * The streaming view reuses this with isStreaming=true for the accumulating
 * text with a blinking cursor.
 */
export default function ChatMessage({ role, content, isStreaming = false }) {
  const isUser = role === "user";
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className={`text-xs font-semibold ${isUser ? "text-blue-600" : "text-indigo-500"}`}>
            {isUser ? "You" : "Gemini AI"}
          </span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>

        {/* Message bubble */}
        <div
          className={`max-w-[70%] px-4 py-3 shadow-sm ${
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
