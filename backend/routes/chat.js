const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load MCP context files
let storeContext = {};
try {
  const mcpPath = path.join(__dirname, "..", "mcp");
  storeContext = {
    storeInfo: JSON.parse(fs.readFileSync(path.join(mcpPath, "store_info.json"), "utf8")),
    products: JSON.parse(fs.readFileSync(path.join(mcpPath, "products_context.json"), "utf8")),
    navigation: JSON.parse(fs.readFileSync(path.join(mcpPath, "navigation.json"), "utf8")),
    faq: JSON.parse(fs.readFileSync(path.join(mcpPath, "faq.json"), "utf8")),
  };
  console.log("✅ MCP context loaded successfully");
} catch (error) {
  console.error("⚠️ Warning: Could not load MCP context files:", error.message);
}

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

    // Build comprehensive system prompt with MCP context
    const systemPrompt = `You are a helpful AI assistant for StyleNest, an e-commerce fashion platform.

STORE INFORMATION:
- Store Name: ${storeContext.storeInfo?.store_name || "StyleNest"}
- Description: ${storeContext.storeInfo?.description || "Premium fashion platform"}
- Currency: ${storeContext.storeInfo?.policies?.currency || "₹"}

AVAILABLE CATEGORIES:
${Object.entries(storeContext.products?.categories || {}).map(([key, cat]) => 
  `- ${cat.name} (${cat.url}): ${cat.description}`
).join('\n')}

NAVIGATION HELP:
- Shop page: / (shows all products)
- Men's fashion: /mens
- Women's fashion: /womens
- Kids' fashion: /kids
- Cart: Click cart icon in top right
- Login/Account: Click Login button in top navigation

YOUR CAPABILITIES:
- Help users navigate the website
- Provide information about product categories
- Answer questions about shopping features
- Guide users to specific sections
- Provide store policies and general information

IMPORTANT GUIDELINES:
- Be concise, friendly, and helpful
- Use bullet points for lists
- Use **bold** for emphasis on key terms
- Provide direct navigation instructions when needed
- If you don't know specific product prices or inventory, guide users to browse the categories
- Always include relevant URLs when directing users (e.g., "Go to /womens for women's fashion")

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
