import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import { setupSocketHandlers } from "./socket/socketHandler.js";

const app = express();
const server = http.createServer(app);

// --- Express middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(express.json());

// --- REST API routes ---
// All conversation CRUD lives under /api/conversations
app.use("/api/conversations", conversationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- Socket.IO server (for real-time streaming) ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

setupSocketHandlers(io);

// --- Start ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🌐 REST API at http://localhost:${PORT}/api/conversations`);
  });
});
