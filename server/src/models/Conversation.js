import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * A Conversation = one chat thread.
 * The History Sidebar in the UI lists these threads.
 * tone stores the user's last-selected tone so we can persist it.
 */
const conversationSchema = new mongoose.Schema(
  {
    threadId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "New Chat" },
    tone: {
      type: String,
      enum: ["professional", "casual", "concise"],
      default: "professional",
    },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
