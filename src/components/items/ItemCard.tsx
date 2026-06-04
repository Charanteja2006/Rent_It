import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  rentPerDay: number;
  isAvailable: boolean;
  owner: { id: string; name: string; image: string | null };
}

export function ItemCard({
  id,
  name,
  imageUrl,
  tags,
  rentPerDay,
  isAvailable,
  owner,
}: ItemCardProps) {
  return (
    <Link
      href={`/items/${id}`}
      id={`item-card-${id}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Availability badge */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold",
              isAvailable
                ? "bg-emerald-500/90 text-white"
                : "bg-slate-600/90 text-white"
            )}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
              +{tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(rentPerDay)}
            </span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
          <div className="flex items-center gap-2">
            <UserAvatar name={owner.name} image={owner.image} size="sm" />
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
              {owner.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
