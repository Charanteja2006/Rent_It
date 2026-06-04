import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ItemGrid } from "@/components/items/ItemGrid";
import { CalendarDays, Package } from "lucide-react";
import type { Metadata } from "next";

interface ProfilePageProps {
  params: { userId: string };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  return { title: user ? `${user.name}'s Profile` : "Profile" };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      items: {
        where: { isAvailable: true },
        include: {
          owner: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl border border-border bg-card">
        <UserAvatar name={user.name} image={user.image} size="xl" />
        <div className="text-center sm:text-left space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center sm:justify-start">
            <CalendarDays className="h-4 w-4" />
            <span>Member since {formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center sm:justify-start">
            <Package className="h-4 w-4" />
            <span>{user.items.length} active listing{user.items.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Active Listings by {user.name}
        </h2>
        <ItemGrid items={user.items as unknown as Parameters<typeof ItemGrid>[0]["items"]} />
      </div>
    </div>
  );
}
