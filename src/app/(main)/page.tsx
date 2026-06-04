"use client";

import { useState, useEffect, useCallback } from "react";
import { ItemGrid } from "@/components/items/ItemGrid";
import { SearchBar } from "@/components/common/SearchBar";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useItemFilters } from "@/hooks/useItemFilters";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Item, SortOption } from "@/types";

const ALL_TAGS = [
  "electronics", "camera", "tools", "furniture", "sports",
  "outdoor", "clothing", "books", "kitchen", "gaming",
  "music", "bicycle", "vehicle", "party", "garden",
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { search, setSearch, selectedTags, toggleTag, sort, setSort, buildQueryString } =
    useItemFilters();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQueryString();
      const res = await fetch(`/api/items${qs ? `?${qs}` : ""}`);
      const json = await res.json();
      setItems(json.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    const debounce = setTimeout(fetchItems, 300);
    return () => clearTimeout(debounce);
  }, [fetchItems]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Borrow anything,{" "}
          <span className="text-gradient">from anyone</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          A community-driven rental platform. List what you own, borrow what you need — and meet your neighbors.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/items/new"
            id="hero-list-item-btn"
            className="px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity"
          >
            List Your Item
          </Link>
          <button
            onClick={() => document.getElementById("search-bar")?.focus()}
            id="hero-browse-btn"
            className="px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted font-semibold transition-colors"
          >
            Browse Items
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 sticky top-16 z-20 bg-background/80 backdrop-blur-sm py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border">
        {/* Search + Sort */}
        <div className="flex gap-3 items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              id="sort-select"
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3 w-3" />
            Filter:
          </span>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              id={`tag-filter-${tag}`}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                selectedTags.includes(tag)
                  ? "bg-primary text-white border-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => selectedTags.forEach(toggleTag)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <LoadingSkeleton variant="card" count={8} />
      ) : (
        <ItemGrid items={items} />
      )}
    </div>
  );
}
