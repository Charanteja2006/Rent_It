"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      id="not-found-back-btn"
      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted font-semibold transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Go Back
    </button>
  );
}
