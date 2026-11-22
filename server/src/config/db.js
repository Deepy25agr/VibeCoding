import mongoose from "mongoose";

/**
 * Connects to MongoDB using the URI from environment variables.
 * This is called once at server startup. Mongoose handles reconnection
 * automatically if the connection drops.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_chat_assistant";

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};
