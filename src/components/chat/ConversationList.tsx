import Link from "next/link";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  activeId?: string;
}

export function ConversationList({
  conversations,
  currentUserId,
  activeId,
}: ConversationListProps) {
  return (
    <div className="space-y-1">
      {conversations.map((convo) => {
        const isOwner = convo.ownerId === currentUserId;
        const otherUser = isOwner ? convo.renter! : convo.owner!;
        const lastMsg = convo.messages?.[0];
        const isActive = convo.id === activeId;

        return (
          <Link
            key={convo.id}
            href={`/messages/${convo.id}`}
            id={`conversation-${convo.id}`}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl transition-all duration-150",
              isActive
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/60 border border-transparent"
            )}
          >
            <UserAvatar name={otherUser.name} image={otherUser.image} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm text-foreground truncate">
                  {otherUser.name}
                </p>
                {lastMsg && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatRelativeTime(lastMsg.createdAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-primary/80 font-medium truncate">
                {convo.item?.name}
              </p>
              {lastMsg ? (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {lastMsg.sender?.id === currentUserId ? "You: " : ""}
                  {truncate(lastMsg.content, 60)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic mt-0.5">No messages yet</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
