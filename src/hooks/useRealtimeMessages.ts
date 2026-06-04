"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Message } from "@/types";

export function useRealtimeMessages(
  conversationId: string,
  initialMessages: Message[]
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Poll for new messages as a fallback (every 5 seconds)
  const pollMessages = useCallback(async () => {
    if (realtimeConnected || !conversationId) return;
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setMessages((prev) => {
          // Merge: keep any optimistic messages not in the server response
          const serverIds = new Set(json.data.map((m: Message) => m.id));
          const optimistic = prev.filter((m) => m.id.startsWith("optimistic-"));
          const merged = [
            ...json.data,
            ...optimistic.filter((m) => !serverIds.has(m.id)),
          ];
          return merged;
        });
      }
    } catch {
      // Silent fail — realtime is the primary channel
    }
  }, [conversationId, realtimeConnected]);

  useEffect(() => {
    if (!conversationId) return;

    // Set up Supabase realtime subscription
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates (optimistic update may have already added it)
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeConnected(true);
        } else {
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setRealtimeConnected(false);
    };
  }, [conversationId]);

  // Polling fallback when realtime is not connected
  useEffect(() => {
    if (realtimeConnected) return;
    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [realtimeConnected, pollMessages]);

  return { messages, setMessages };
}
