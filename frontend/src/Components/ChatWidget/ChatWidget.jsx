import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatWidget.css";
import logo from "../Assets/logo.png";

// Enhanced markdown parser with clickable links
const MarkdownText = ({ content, onNavigate }) => {
  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, i) => {
      // Check for route links - matches /mens, /womens, /kids, /cart, /login anywhere
      const routeRegex = /\/(mens|womens|kids|cart|login)\b/gi;
      const hasRoutes = routeRegex.test(line);

      if (hasRoutes) {
        // Reset regex lastIndex
        routeRegex.lastIndex = 0;
        
        // Split by routes while keeping them
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = routeRegex.exec(line)) !== null) {
          // Add text before the route
          if (match.index > lastIndex) {
            parts.push({ type: 'text', content: line.substring(lastIndex, match.index) });
          }
          // Add the route
          parts.push({ type: 'route', content: match[0] });
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < line.length) {
          parts.push({ type: 'text', content: line.substring(lastIndex) });
        }
        
        const lineElements = parts.map((part, idx) => {
          if (part.type === 'route') {
            return (
              <button
                key={`${i}-${idx}`}
                className="chat-link-button"
                onClick={() => onNavigate(part.content)}
              >
                Go to {part.content}
              </button>
            );
          } else {
            // Apply markdown formatting
            let formatted = part.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
            return <span key={`${i}-${idx}`} dangerouslySetInnerHTML={{ __html: formatted }} />;
          }
        });
        
        elements.push(<div key={i} className="chat-line">{lineElements}</div>);
      } else {
        // Regular line without routes
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          formatted = '<li>' + formatted.trim().substring(2) + '</li>';
        }
        
        elements.push(<div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />);
      }
    });

    return elements;
  };

  return <div className="markdown-content">{parseMarkdown(content)}</div>;
};

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "👋 Hi! I'm your StyleNest AI assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle navigation from clickable links
  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false); // Close chat after navigation
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message to chat
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Prepare conversation history (exclude welcome message)
      const history = messages
        .slice(1) // Skip welcome message
        .map((msg) => ({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.content,
        }));

      // Call backend API
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: history,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...newMessages, { role: "bot", content: data.response }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "bot",
            content: `❌ ${data.error || "Something went wrong. Please try again."}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "bot",
          content:
            "❌ Unable to connect to the AI service. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`chat-fab ${isOpen ? "chat-fab-open" : ""}`}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <img src={logo} alt="StyleNest AI" className="chat-fab-logo" />
        )}
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? "chat-window-open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-avatar">
              <img src={logo} alt="StyleNest" className="chat-avatar-logo" />
            </div>
            <div>
              <h3 className="chat-title">StyleNest AI</h3>
              <p className="chat-status">
                {isLoading ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <button
            className="chat-close-btn"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.role === "user" ? "chat-message-user" : "chat-message-bot"
              }`}
            >
              <div className="chat-message-bubble">
                {message.role === "bot" ? (
                  <MarkdownText content={message.content} onNavigate={handleNavigate} />
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message chat-message-bot">
              <div className="chat-message-bubble">
                <div className="chat-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form className="chat-input-container" onSubmit={sendMessage}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatWidget;
