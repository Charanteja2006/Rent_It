"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setValue("");
    try {
      await onSend(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-border bg-card/50 backdrop-blur-sm">
      <textarea
        id="message-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        rows={1}
        placeholder="Type a message... (Enter to send)"
        className={cn(
          "flex-1 resize-none rounded-xl px-4 py-2.5 text-sm",
          "bg-background border border-input text-foreground",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          "max-h-32 overflow-y-auto transition-all",
          (disabled || sending) && "opacity-60"
        )}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
        }}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || sending || disabled}
        id="message-send-btn"
        className={cn(
          "flex-shrink-0 p-2.5 rounded-xl gradient-brand text-white",
          "hover:opacity-90 disabled:opacity-40 transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-ring"
        )}
        aria-label="Send message"
      >
        {sending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
