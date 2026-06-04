import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/chat/MessageThread";
import { UserAvatar } from "@/components/common/UserAvatar";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface ChatPageProps {
  params: { conversationId: string };
}

export const metadata: Metadata = { title: "Chat" };

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      item: { select: { id: true, name: true, imageUrl: true } },
      owner: { select: { id: true, name: true, image: true } },
      renter: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!conversation) notFound();

  const isParticipant =
    conversation.ownerId === session.user.id ||
    conversation.renterId === session.user.id;

  if (!isParticipant) redirect("/messages");

  const isOwner = conversation.ownerId === session.user.id;
  const otherUser = isOwner ? conversation.renter : conversation.owner;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border border-border rounded-t-2xl bg-card">
        <Link
          href="/messages"
          id="back-to-messages"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <UserAvatar
          name={otherUser?.name || "User"}
          image={otherUser?.image}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{otherUser?.name}</p>
          <Link
            href={`/items/${conversation.item.id}`}
            className="text-xs text-primary hover:underline truncate block"
          >
            {conversation.item.name}
          </Link>
        </div>

        <Link href={`/items/${conversation.item.id}`}>
          <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={conversation.item.imageUrl}
              alt={conversation.item.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        </Link>
      </div>

      {/* Thread */}
      <div className="flex-1 border-x border-border overflow-hidden">
        <MessageThread
          conversationId={conversation.id}
          initialMessages={conversation.messages as Parameters<typeof MessageThread>[0]["initialMessages"]}
          currentUserId={session.user.id!}
          currentUserName={session.user.name || "You"}
          currentUserImage={session.user.image || null}
        />
      </div>
    </div>
  );
}
