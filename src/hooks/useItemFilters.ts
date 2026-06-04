"use client";

import { useState, useCallback } from "react";
import type { SortOption } from "@/types";

export function useItemFilters() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedTags([]);
    setSort("newest");
  }, []);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (sort !== "newest") params.set("sort", sort);
    return params.toString();
  }, [search, selectedTags, sort]);

  return {
    search,
    setSearch,
    selectedTags,
    toggleTag,
    sort,
    setSort,
    clearFilters,
    buildQueryString,
  };
}
