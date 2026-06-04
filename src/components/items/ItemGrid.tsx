import { ItemCard } from "./ItemCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PackageSearch } from "lucide-react";
import type { Item } from "@/types";

interface ItemGridProps {
  items: Item[];
}

export function ItemGrid({ items }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-8 w-8" />}
        title="No items found"
        description="Try adjusting your search or filters. New items are listed every day!"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          id={item.id}
          name={item.name}
          imageUrl={item.imageUrl}
          tags={item.tags}
          rentPerDay={Number(item.rentPerDay)}
          isAvailable={item.isAvailable}
          owner={item.owner as { id: string; name: string; image: string | null }}
        />
      ))}
    </div>
  );
}
