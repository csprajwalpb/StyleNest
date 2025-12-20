const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/chat
 * Body: { message: string, history: array }
 * Returns: { success: boolean, response: string, error?: string }
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid message",
      });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return res.status(500).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    // Get the generative model - using stable model with better free tier
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Build conversation context from history
    let conversationContext = "";
    if (history && Array.isArray(history) && history.length > 0) {
      conversationContext = history
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");
      conversationContext += "\n";
    }

    // Add system instructions for better responses
    const systemPrompt = `You are a helpful AI assistant for StyleNest, an e-commerce fashion platform. 
Be concise, friendly, and helpful. Assist users with product inquiries, shopping guidance, and general questions.
If you don't know something specific about the store, politely say so.

${conversationContext}User: ${message}
Assistant:`;

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Handle specific error types
    if (error.message?.includes("API key")) {
      return res.status(500).json({
        success: false,
        error: "AI service authentication failed. Please contact support.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "An error occurred while processing your request. Please try again.",
    });
  }
});

module.exports = router;
