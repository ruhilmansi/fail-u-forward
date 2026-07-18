"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const Chatbot = () => {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState(
    "You are Sadbot, a chatbot that empathizes with sadness and provides comforting advice. BUT DONT BE TOO CArried away while doing so...answer to the point while maintaining the empathy"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(() => {
    if (chatHistory.length > 0 || isLoading) {
      setTimeout(scrollToBottom, 100);
    }
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(scrollToBottom, 200);
      inputRef.current?.focus();
    }
  }, [isChatOpen, chatHistory.length]);

  if (pathname !== "/") return null;

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    const newMessage: ChatMessage = {
      sender: "user",
      text: currentMessage,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, newMessage]);
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentMessage, prompt }),
      });

      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data?.response || "Error connecting with the server",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Error:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Network error. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={toggleChat}
            type="button"
            aria-label="Open chat"
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition flex items-center justify-center"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {isChatOpen && (
        <div
          className="z-50 bg-background shadow-2xl rounded-xl border border-border flex flex-col overflow-hidden resize-none fixed bottom-4 right-4 w-[90vw] h-[70vh] sm:w-[24rem] sm:h-[32rem] sm:bottom-6 sm:right-6"
          style={{
            minWidth: "300px",
            minHeight: "300px",
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
        >
          <div className="flex justify-between items-center p-4 border-b border-border">
            <span className="font-medium text-sm text-foreground">assistant</span>
            <button
              onClick={toggleChat}
              className="text-muted-foreground hover:text-foreground text-sm transition"
            >
              close
            </button>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-1 p-3 overflow-y-auto no-scrollbar"
          >
            {chatHistory.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">how are you doing today?</p>
              </div>
            )}

            <div className="space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <p>{msg.text}</p>
                    <span className="block text-[10px] text-muted-foreground/60 mt-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} className="h-0" />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="type your message..."
                className="flex-1 p-2.5 rounded-lg bg-muted text-foreground text-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                send
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Chatbot;
