"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Lock,
  User,
  Bot,
  ImageIcon,
  Play,
  FileText,
  Globe,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  assets?: any[];
}

interface ChatInterfaceProps {
  initialQuery: string;
  onBack: () => void;
}

export default function ChatInterface({
  initialQuery,
  onBack,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (query: string = input) => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/api/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok)
        throw new Error("Failed to fetch response from the server");

      const data = await response.json();

      const parsedResponse = data.response || "No response received.";

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: parsedResponse,
        assets: data.assets || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          role: "assistant",
          content: "⚠️ Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const typeIcons: { [key: string]: any } = {
    Image: ImageIcon,
    Video: Play,
    Paper: FileText,
    Link: Globe,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col bg-background pt-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-4 md:px-8 py-4 border-b border-border bg-card/40 backdrop-blur-md">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back</span>
        </motion.button>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
          x404 atxp MCP Agent
        </h1>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Bot className="text-blue-500 mt-1 shrink-0" size={24} />
              )}
              {message.role === "user" && (
                <User className="text-gray-400 mt-1 shrink-0" size={24} />
              )}

              <div
                className={`max-w-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-3xl rounded-tr-lg"
                    : "bg-muted text-foreground rounded-3xl rounded-tl-lg"
                } px-6 py-4`}
              >
                <p className="whitespace-pre-line">{message.content}</p>

                {/* Asset Cards */}
                {message.assets && message.assets.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {message.assets.map((asset) => {
                      const IconComponent = typeIcons[asset.type] || FileText;
                      return (
                        <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                              {asset.title}
                            </h3>
                            <div className="ml-2 p-2 rounded bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                              <IconComponent
                                size={16}
                                className="text-blue-500"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
                            {asset.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              {asset.price} ETH
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                              <Lock size={14} />
                              Request
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-center gap-3"
            >
              <Bot className="text-blue-500" size={24} />
              <div className="flex gap-2 px-6 py-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-blue-500"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 md:px-8 py-4 bg-background">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isLoading && handleSendMessage()
            }
            placeholder="Ask x404 Agent anything..."
            className="flex-1 px-6 py-3 rounded-full bg-card border border-border focus:border-blue-500 outline-none text-foreground placeholder:text-foreground/40 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
