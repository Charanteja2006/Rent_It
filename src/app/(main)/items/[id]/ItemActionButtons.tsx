"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface ItemActionButtonsProps {
  itemId: string;
  itemName: string;
}

export function ItemActionButtons({ itemId, itemName }: ItemActionButtonsProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast.success("Listing deleted");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/items/${itemId}/edit`}
        id={`edit-item-${itemId}`}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Edit Listing
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        id={`delete-item-${itemId}`}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive hover:text-white text-destructive text-sm font-medium disabled:opacity-60 transition-all"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
