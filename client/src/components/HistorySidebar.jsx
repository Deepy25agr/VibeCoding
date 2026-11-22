import { useState } from "react";

/**
 * History Sidebar — lists all past conversation threads.
 *
 * Actions per thread:
 *   - Click: load it into the chat view
 *   - Pencil icon: rename the thread inline (Enter to save, Esc to cancel)
 *   - Trash icon: delete the thread
 */
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return "just now";
  if (diffHours < 24)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function HistorySidebar({
  conversations,
  activeThreadId,
  onSelect,
  onDelete,
  onNewChat,
  onRename,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const startEditing = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.threadId);
    setEditingTitle(conv.title);
  };

  const saveEdit = () => {
    const current = conversations.find((c) => c.threadId === editingId);
    if (editingTitle.trim() && current && editingTitle.trim() !== current.title) {
      onRename(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <aside className="w-72 h-full bg-slate-900 flex flex-col">
      {/* Brand header */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
            </svg>
          </div>
          <span className="text-white font-bold text-base">AI Chat</span>
        </div>

        {/* New Chat button */}
        <button
          onClick={onNewChat}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="text-center mt-8 px-4">
            <p className="text-slate-500 text-sm">No conversations yet.</p>
            <p className="text-slate-600 text-xs mt-1">Start a new chat!</p>
          </div>
        ) : (
          <div className="px-2 py-2">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
              Recent
            </p>
            {conversations.map((conv) => (
              <div
                key={conv.threadId}
                onClick={() => onSelect(conv.threadId)}
                className={`group flex items-center justify-between px-2.5 py-2.5 rounded-lg cursor-pointer mb-0.5 transition-colors ${
                  activeThreadId === conv.threadId
                    ? "bg-slate-800"
                    : "hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Chat icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`flex-shrink-0 ${
                      activeThreadId === conv.threadId ? "text-indigo-400" : "text-slate-500"
                    }`}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    {/* Editable title or static title */}
                    {editingId === conv.threadId ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={saveEdit}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-sm font-medium text-white bg-slate-700 border border-indigo-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    ) : (
                      <p
                        className={`text-sm font-medium truncate ${
                          activeThreadId === conv.threadId
                            ? "text-white"
                            : "text-slate-300"
                        }`}
                      >
                        {conv.title}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatTime(conv.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Action buttons (visible on hover) */}
                <div className="ml-1.5 flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={(e) => startEditing(e, conv)}
                    className="p-1.5 text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-slate-700"
                    title="Rename"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.threadId);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-slate-700"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Powered by Gemini API</span>
        </div>
      </div>
    </aside>
  );
}
