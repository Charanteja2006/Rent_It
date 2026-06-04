"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const SUGGESTED_TAGS = [
  "electronics", "camera", "tools", "furniture", "sports",
  "outdoor", "clothing", "books", "kitchen", "gaming",
  "music", "bicycle", "vehicle", "party", "garden",
];

export function TagSelector({
  value,
  onChange,
  placeholder = "Add a tag...",
}: TagSelectorProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || value.includes(normalized) || value.length >= 10) return;
    onChange([...value, normalized]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (t) => !value.includes(t) && t.includes(input.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Input area */}
      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 min-h-[44px] rounded-xl border border-input bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all"
        )}
        onClick={() => document.getElementById("tag-input")?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="hover:text-primary/60 transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id="tag-input"
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border bg-muted hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-xs font-medium transition-all"
            >
              <Plus className="h-3 w-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add. {10 - value.length} tag{10 - value.length !== 1 ? "s" : ""} remaining.
      </p>
    </div>
  );
}
