import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-7 w-7", text: "text-xs" },
  md: { container: "h-9 w-9", text: "text-sm" },
  lg: { container: "h-12 w-12", text: "text-base" },
  xl: { container: "h-20 w-20", text: "text-xl" },
};

export function UserAvatar({ name, image, size = "md", className }: UserAvatarProps) {
  const { container, text } = sizeMap[size];

  if (image) {
    return (
      <div className={cn("relative rounded-full overflow-hidden flex-shrink-0", container, className)}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
        "gradient-brand text-white",
        container,
        text,
        className
      )}
      aria-label={`Avatar for ${name}`}
    >
      {getInitials(name)}
    </div>
  );
}
