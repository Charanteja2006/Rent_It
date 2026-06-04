"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilityToggleProps {
  itemId: string;
  isAvailable: boolean;
  compact?: boolean;
}

export function AvailabilityToggle({
  itemId,
  isAvailable: initialAvailable,
  compact = false,
}: AvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const newValue = !isAvailable;

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newValue }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");

      setIsAvailable(newValue);
      toast.success(newValue ? "Item marked as available" : "Item marked as unavailable");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        id={`availability-toggle-${itemId}`}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
          isAvailable ? "bg-emerald-500" : "bg-muted-foreground/30",
          loading && "opacity-60"
        )}
        aria-label={isAvailable ? "Mark as unavailable" : "Mark as available"}
        role="switch"
        aria-checked={isAvailable}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-white mx-auto" />
        ) : (
          <span
            className={cn(
              "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
              isAvailable ? "translate-x-[18px]" : "translate-x-[3px]"
            )}
          />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Availability</p>
        <p className="text-xs text-muted-foreground">
          {isAvailable ? "Renters can see and request this item" : "Item is hidden from renters"}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        id={`availability-toggle-${itemId}`}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
          isAvailable ? "bg-emerald-500" : "bg-muted-foreground/30",
          loading && "opacity-60"
        )}
        role="switch"
        aria-checked={isAvailable}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-white mx-auto" />
        ) : (
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
              isAvailable ? "translate-x-6" : "translate-x-1"
            )}
          />
        )}
      </button>
    </div>
  );
}
