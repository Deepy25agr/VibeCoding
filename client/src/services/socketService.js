import { io } from "socket.io-client";

/**
 * Singleton Socket.IO client.
 *
 * The socket connection is created once and reused across components.
 * It carries the real-time streaming events between frontend and backend:
 *   Outbound:  chat:send   →  { threadId, message, tone }
 *   Inbound:   chat:token  →  { threadId, token }  (each text chunk)
 *   Inbound:   chat:done   →  { threadId, fullResponse }
 *   Inbound:   chat:error  →  { threadId, error }
 */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}
