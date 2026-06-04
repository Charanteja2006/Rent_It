"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "@/components/common/EmptyState";
import { MessageSquare } from "lucide-react";
import type { Message } from "@/types";

interface MessageThreadProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  currentUserName,
  currentUserImage,
}: MessageThreadProps) {
  const { messages, setMessages } = useRealtimeMessages(conversationId, initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    // Optimistic update
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      content,
      createdAt: new Date(),
      sender: {
        id: currentUserId,
        name: currentUserName,
        email: "",
        image: currentUserImage,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? { ...json.data, sender: json.data.sender } : m))
      );
    } catch (err) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="No messages yet"
            description="Start the conversation by sending a message below."
          />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message as Message & { sender: { id: string; name: string; image: string | null } }}
              isMine={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
