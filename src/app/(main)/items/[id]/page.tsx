import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { RentalRequestForm } from "@/components/rental/RentalRequestForm";
import { AvailabilityToggle } from "@/components/rental/AvailabilityToggle";
import { ItemActionButtons } from "./ItemActionButtons";
import { MessageOwnerButton } from "./MessageOwnerButton";
import { CalendarDays, Tag, User, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

interface ItemPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const item = await prisma.item.findUnique({ where: { id: params.id } });
  return { title: item?.name || "Item", description: item?.description };
}

export default async function ItemDetailPage({ params }: ItemPageProps) {
  const session = await auth();

  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, image: true, createdAt: true } },
    },
  });

  if (!item) notFound();

  const isOwner = session?.user?.id === item.ownerId;
  const isAuthenticated = !!session?.user?.id;

  let existingRequest = null;
  if (isAuthenticated && !isOwner) {
    existingRequest = await prisma.rentalRequest.findFirst({
      where: { itemId: item.id, requesterId: session!.user!.id! },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold",
                item.isAvailable ? "bg-emerald-500/90 text-white" : "bg-slate-600/90 text-white"
              )}
            >
              {item.isAvailable ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {item.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatPrice(Number(item.rentPerDay))}
              <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Tag className="h-3 w-3" />{tag}
              </span>
            ))}
          </div>

          {/* Dates */}
          {(item.availableFrom || item.availableUntil) && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {item.availableFrom && `From ${formatDate(item.availableFrom)}`}
                {item.availableFrom && item.availableUntil && " — "}
                {item.availableUntil && `Until ${formatDate(item.availableUntil)}`}
              </span>
            </div>
          )}

          {/* Owner */}
          <Link href={`/profile/${item.owner.id}`} id="owner-profile-link"
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all"
          >
            <UserAvatar name={item.owner.name} image={item.owner.image} size="md" />
            <div>
              <p className="text-sm font-semibold text-foreground">{item.owner.name}</p>
              <p className="text-xs text-muted-foreground">Member since {formatDate(item.owner.createdAt)}</p>
            </div>
            <User className="h-4 w-4 text-muted-foreground ml-auto" />
          </Link>

          {/* Actions */}
          <div className="space-y-3">
            {isOwner ? (
              <>
                <AvailabilityToggle itemId={item.id} isAvailable={item.isAvailable} />
                <ItemActionButtons itemId={item.id} itemName={item.name} />
              </>
            ) : isAuthenticated ? (
              <>
                {existingRequest ? (
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <p className="text-sm font-medium text-foreground">Your rental request</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status:{" "}
                      <span className={cn("font-semibold capitalize",
                        existingRequest.status === "approved" && "text-emerald-600",
                        existingRequest.status === "declined" && "text-destructive",
                        existingRequest.status === "pending" && "text-amber-600",
                      )}>
                        {existingRequest.status}
                      </span>
                    </p>
                  </div>
                ) : item.isAvailable ? (
                  <RentalRequestForm itemId={item.id} rentPerDay={Number(item.rentPerDay)} />
                ) : (
                  <div className="p-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
                    This item is currently unavailable for rental.
                  </div>
                )}
                <MessageOwnerButton itemId={item.id} />
              </>
            ) : (
              <Link href="/login" id="login-to-rent-btn"
                className="w-full flex justify-center py-3 px-6 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Login to Request Rental
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">About this item</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
      </div>
    </div>
  );
}
