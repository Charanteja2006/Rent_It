"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIChatMessage } from "@/types";

interface AISupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WELCOME = "Hi! 👋 I'm your RentIt assistant. How can I help you today?";

export function AISupportPanel({ isOpen, onClose }: AISupportPanelProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: AIChatMessage = { role: "user", parts: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");

      setMessages((prev) => [...prev, { role: "model", parts: json.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: "Sorry, I'm having trouble right now. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-over panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-96 z-50",
          "bg-background border-l border-border shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="AI Support Panel"
        id="ai-support-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border gradient-brand">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">RentIt Support</h2>
              <p className="text-xs text-white/70">AI-powered assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="ai-support-close-btn"
            className="p-1.5 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
            aria-label="Close support panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          <div className="flex gap-2">
            <div className="p-1.5 rounded-full bg-primary/10 flex-shrink-0 self-end">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-foreground max-w-[85%]">
              {WELCOME}
            </div>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 animate-fade-in",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full flex-shrink-0 self-end",
                  msg.role === "user" ? "bg-primary/10" : "bg-muted"
                )}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "gradient-brand text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                {msg.parts}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="p-1.5 rounded-full bg-muted flex-shrink-0 self-end">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              id="ai-support-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about RentIt..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              id="ai-support-send-btn"
              className="p-2.5 rounded-xl gradient-brand text-white hover:opacity-90 disabled:opacity-40 transition-all"
              aria-label="Send message to AI"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </>
  );
}
