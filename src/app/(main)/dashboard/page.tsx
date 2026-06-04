"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDate, formatPrice } from "@/lib/utils";
import { RentalRequestCard } from "@/components/rental/RentalRequestCard";
import { AvailabilityToggle } from "@/components/rental/AvailabilityToggle";
import { ItemActionButtons } from "@/app/(main)/items/[id]/ItemActionButtons";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Package, ClipboardList, CheckCircle, Pencil, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((j) => j.data);

type Tab = "listings" | "requests" | "active";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("listings");

  if (status === "unauthenticated") redirect("/login");

  const { data: items, isLoading: itemsLoading, mutate: mutateItems } = useSWR(
    session ? `/api/items?ownerId=${session.user?.id}` : null,
    fetcher
  );

  // Fetch incoming requests (for all the user's items)
  const { data: allRequests, isLoading: requestsLoading, mutate: mutateRequests } = useSWR(
    session ? "/api/rental-requests/incoming" : null,
    fetcher
  );

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="row" count={4} />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "listings", label: "My Listings", icon: <Package className="h-4 w-4" /> },
    { key: "requests", label: "Incoming Requests", icon: <ClipboardList className="h-4 w-4" /> },
    { key: "active", label: "Active Rentals", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const ownedItems = (items || []).filter((i: { ownerId: string }) => i.ownerId === session?.user?.id);
  const pendingRequests = (allRequests || []).filter((r: { status: string }) => r.status === "pending");
  const activeRentals = (allRequests || []).filter((r: { status: string }) => r.status === "approved");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your listings and rental requests</p>
        </div>
        <Link
          href="/items/new"
          id="dashboard-new-listing-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "My Listings", value: ownedItems.length, color: "text-primary" },
          { label: "Pending Requests", value: pendingRequests.length, color: "text-amber-600" },
          { label: "Active Rentals", value: activeRentals.length, color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              id={`dashboard-tab-${key}`}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {/* My Listings tab */}
          {tab === "listings" && (
            <div>
              {itemsLoading ? (
                <LoadingSkeleton variant="row" count={4} />
              ) : ownedItems.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-8 w-8" />}
                  title="No listings yet"
                  description="Create your first item listing to start renting out your belongings."
                  action={
                    <Link href="/items/new" className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold">
                      Create Listing
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {ownedItems.map((item: { id: string; name: string; imageUrl: string; rentPerDay: number; isAvailable: boolean; createdAt: string }) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/items/${item.id}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate block">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{formatPrice(item.rentPerDay)}/day · Listed {formatDate(item.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <AvailabilityToggle itemId={item.id} isAvailable={item.isAvailable} compact />
                        <Link href={`/items/${item.id}/edit`} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Incoming Requests tab */}
          {tab === "requests" && (
            <div>
              {requestsLoading ? (
                <LoadingSkeleton variant="row" count={3} />
              ) : pendingRequests.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList className="h-8 w-8" />}
                  title="No pending requests"
                  description="When renters request your items, they'll appear here for you to approve or decline."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequests.map((req: { id: string; item: { id: string; name: string; imageUrl: string }; requester: { id: string; name: string; image: string | null }; startDate: Date; endDate: Date; status: "pending" | "approved" | "declined" | "returned"; note: string | null; createdAt: Date; updatedAt: Date; itemId: string; requesterId: string }) => (
                    <RentalRequestCard key={req.id} request={req as unknown as Parameters<typeof RentalRequestCard>[0]["request"]} isOwnerView />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Rentals tab */}
          {tab === "active" && (
            <div>
              {requestsLoading ? (
                <LoadingSkeleton variant="row" count={3} />
              ) : activeRentals.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="h-8 w-8" />}
                  title="No active rentals"
                  description="Approved rentals will appear here. Mark them as returned once the item is back."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRentals.map((req: { id: string; item: { id: string; name: string; imageUrl: string }; requester: { id: string; name: string; image: string | null }; startDate: Date; endDate: Date; status: "pending" | "approved" | "declined" | "returned"; note: string | null; createdAt: Date; updatedAt: Date; itemId: string; requesterId: string }) => (
                    <RentalRequestCard key={req.id} request={req as unknown as Parameters<typeof RentalRequestCard>[0]["request"]} isOwnerView />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
