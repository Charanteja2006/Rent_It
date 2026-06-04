import { formatRelativeTime } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message & {
    sender: { id: string; name: string; image: string | null };
  };
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-fade-in",
        isMine ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar — only show for other party */}
      {!isMine && (
        <UserAvatar
          name={message.sender.name}
          image={message.sender.image}
          size="sm"
          className="flex-shrink-0 mb-1"
        />
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] space-y-1",
          isMine ? "items-end" : "items-start",
          "flex flex-col"
        )}
      >
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isMine
              ? "gradient-brand text-white rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
