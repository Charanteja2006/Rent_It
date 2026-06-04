"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { formatDate, formatPrice, daysBetween } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";
import type { RentalRequest } from "@/types";

interface RentalRequestCardProps {
  request: RentalRequest & {
    item: { id: string; name: string; imageUrl: string };
    requester: { id: string; name: string; image: string | null };
  };
  isOwnerView?: boolean;
}

const statusConfig = {
  pending: { label: "Pending", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  approved: { label: "Approved", class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  declined: { label: "Declined", class: "bg-destructive/10 text-destructive border-destructive/20" },
  returned: { label: "Returned", class: "bg-muted text-muted-foreground border-border" },
};

export function RentalRequestCard({ request, isOwnerView = false }: RentalRequestCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const days = daysBetween(request.startDate, request.endDate);
  const status = statusConfig[request.status as keyof typeof statusConfig];

  const updateStatus = async (newStatus: "approved" | "declined" | "returned") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rental-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      toast.success(`Request ${newStatus}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4 hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={request.requester.name}
            image={request.requester.image}
            size="md"
          />
          <div>
            <p className="font-semibold text-foreground text-sm">{request.requester.name}</p>
            <p className="text-xs text-muted-foreground">Rental request</p>
          </div>
        </div>
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", status.class)}>
          {status.label}
        </span>
      </div>

      {/* Item info */}
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{request.item.name}</span>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
          <p className="font-medium text-foreground">{formatDate(request.startDate)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Until</p>
          <p className="font-medium text-foreground">{formatDate(request.endDate)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
          <p className="font-medium text-foreground">{days} day{days !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Note */}
      {request.note && (
        <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2">
          &ldquo;{request.note}&rdquo;
        </p>
      )}

      {/* Owner actions */}
      {isOwnerView && request.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => updateStatus("approved")}
            disabled={loading}
            id={`approve-${request.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Approve
          </button>
          <button
            onClick={() => updateStatus("declined")}
            disabled={loading}
            id={`decline-${request.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-sm font-medium disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Decline
          </button>
        </div>
      )}

      {isOwnerView && request.status === "approved" && (
        <button
          onClick={() => updateStatus("returned")}
          disabled={loading}
          id={`returned-${request.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-medium disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          Mark as Returned
        </button>
      )}
    </div>
  );
}
