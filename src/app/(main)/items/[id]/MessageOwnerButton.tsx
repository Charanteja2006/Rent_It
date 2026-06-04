"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Loader2 } from "lucide-react";

export function MessageOwnerButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMessage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      router.push(`/messages/${json.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      id="message-owner-btn"
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-sm font-medium disabled:opacity-60 transition-all"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      Message Owner
    </button>
  );
}
