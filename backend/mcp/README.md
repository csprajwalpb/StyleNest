# MCP (Model Context Protocol) Directory

This directory contains context files that provide the AI chatbot with comprehensive knowledge about the StyleNest e-commerce platform.

## 📁 Context Files

### 1. **store_info.json**
Contains core store information:
- Store name, description, and tagline
- Available categories (Men, Women, Kids)
- Platform features (cart, accounts, payments)
- Store policies (currency, shipping, returns)
- Contact and support information

### 2. **products_context.json**
Provides product and category details:
- Detailed category information with URLs
- Subcategories for each main category
- Women's dress types (maxi, midi, mini, etc.)
- Product attributes and pricing information
- Shopping guidance and tips

### 3. **navigation.json**
Site structure and navigation assistance:
- Main navigation menu structure
- User action locations (cart, login)
- Homepage sections layout
- User journey flows for new and returning customers
- Helpful navigation tips

### 4. **faq.json**
Common questions and answers:
- Frequently asked customer questions
- Quick action references
- Chatbot capabilities and limitations
- Product browsing and shopping guidance

## 🎯 Purpose

These files enable the chatbot to:
- Provide accurate information about the store
- Guide customers to specific pages and features
- Answer common questions effectively
- Assist with navigation and shopping process
- Maintain context-aware conversations

## 🔄 How It Works

The chat route (`backend/routes/chat.js`) loads these JSON files on startup and includes relevant context in every AI prompt, ensuring the chatbot:
- Understands the store structure
- Provides accurate navigation guidance
- References actual URLs and features
- Maintains consistency in responses

## 📝 Updating Context

To update the chatbot's knowledge:
1. Edit the relevant JSON file
2. Restart the backend server to reload the context
3. Test the chatbot to verify changes

## 🚀 Usage Example

When a user asks: *"Where can I find dresses?"*

The chatbot uses context from:
- `products_context.json` → Women's category and dress types
- `navigation.json` → Women's collection URL (/womens)
- `faq.json` → Common dress-related questions

Response: *"Click on 'Women' in the top navigation to browse our women's collection at /womens, which includes various dress styles like maxi, midi, mini, A-line, bodycon, party dresses, and casual dresses."*

## ✨ Benefits

- **Consistent Information**: All responses based on actual store structure
- **Easy Updates**: Modify JSON files without changing code
- **Comprehensive**: Covers store info, products, navigation, and FAQs
- **Scalable**: Easy to add new categories, features, or information

---

**Note**: Always keep these files in sync with actual website features and structure.
