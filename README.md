# AI Chat Assistant

An intelligent chat interface with real-time streaming, conversation history, and a tone toggle that changes the AI's response style instantly.

Built with the **MERN stack** (MongoDB, Express, React, Node.js) + **Socket.IO** for real-time streaming.

## Features

- **Scrollable chat interface** with distinct bubbles for user and AI messages
- **Streaming view** — AI text appears character-by-character via Socket.IO
- **History sidebar** — list of past conversations, click to reload any thread
- **Tone toggle** — Professional / Casual / Concise, sent as a system instruction to the AI
- **MongoDB persistence** — every prompt and response stored with timestamps

## Project Structure

```
VibeCoding/
├── server/                          # Backend (Node + Express + Socket.IO)
│   ├── src/
│   │   ├── config/db.js             # MongoDB connection
│   │   ├── models/Conversation.js   # Mongoose schema (threads + messages)
│   │   ├── services/geminiService.js# Gemini API calls + tone → system instruction
│   │   ├── controllers/             # REST handlers (CRUD + save messages)
│   │   ├── routes/                  # Express route definitions
│   │   ├── socket/socketHandler.js  # Real-time streaming logic
│   │   └── index.js                 # Server entry point
│   ├── package.json
│   └── .env.example
│
├── client/                          # Frontend (React + Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx    # Chat view + streaming + input
│   │   │   ├── ChatMessage.jsx       # Individual chat bubble
│   │   │   ├── HistorySidebar.jsx   # Conversation list
│   │   │   └── ToneToggle.jsx       # Professional/Casual/Concise selector
│   │   ├── services/
│   │   │   ├── socketService.js      # Socket.IO client singleton
│   │   │   └── apiService.js        # REST API calls
│   │   ├── App.jsx                   # Top-level state + layout
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind directives
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)
- A Gemini API key (free via Google AI Studio — no credit card needed)

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY and MongoDB URI
npm run dev
```

The server starts on port 5001 with REST API + Socket.IO.
```
**Note:** macOS Monterey+ uses port 5000 for AirPlay Receiver, so we use port 5001 instead.

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The React app starts on http://localhost:5173.

## How It Works

### Two Data Paths

1. **REST API (persistence)** — thread list, load a thread, create/delete, change tone
2. **Socket.IO (real-time streaming)** — send a message, receive AI tokens as they generate

### The Tone Toggle (Vibe Check)

When the user selects a tone, it is stored per-thread in MongoDB. On each message, the backend converts the tone into a system instruction passed to the Gemini API request:

| Tone          | System Instruction |
|---------------|-------------------|
| Professional  | Formal, precise, business-appropriate language |
| Casual        | Conversational, warm, uses contractions |
| Concise       | Short, to the point, no filler |

This changes the AI's reply style instantly, mid-conversation.

### Streaming Flow

```
User types + sends
    │
    ▼
Socket.IO "chat:send" ──▶ Backend saves user message to MongoDB
    │
    ▼
Backend calls Gemini API (streaming) with tone system instruction
    │
    ▼  (token-by-token)
Socket.IO "chat:token" ──▶ Frontend appends to live bubble
    │
    ▼  (stream ends)
Socket.IO "chat:done"  ──▶ Backend saves full response, Frontend finalizes message
```
