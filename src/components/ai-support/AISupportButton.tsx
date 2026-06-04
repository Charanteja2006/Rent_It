"use client";

import { useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { AISupportPanel } from "./AISupportPanel";

export function AISupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        id="ai-support-open-btn"
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "flex items-center gap-2 px-4 py-3 rounded-full",
          "gradient-brand text-white font-medium text-sm",
          "shadow-lg shadow-primary/30 hover:shadow-primary/50",
          "hover:scale-105 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isOpen && "hidden"
        )}
        aria-label="Open AI Support"
      >
        <MessageCircleQuestion className="h-5 w-5" />
        <span className="hidden sm:inline">Need help?</span>
      </button>

      {/* Panel */}
      <AISupportPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
