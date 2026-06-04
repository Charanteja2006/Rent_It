import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConversationList } from "@/components/chat/ConversationList";
import { EmptyState } from "@/components/common/EmptyState";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "All your conversations with item owners and renters",
};

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { renterId: session.user.id }],
    },
    include: {
      item: { select: { id: true, name: true, imageUrl: true } },
      owner: { select: { id: true, name: true, image: true } },
      renter: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Your conversations with item owners and renters.
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title="No conversations yet"
          description='Browse items and click "Message Owner" to start a conversation.'
          action={
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90"
            >
              Browse Items
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-2">
          <ConversationList
            conversations={conversations as Parameters<typeof ConversationList>[0]["conversations"]}
            currentUserId={session.user.id!}
          />
        </div>
      )}
    </div>
  );
}
