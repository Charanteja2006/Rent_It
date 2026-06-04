import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RentalRequestCard } from "@/components/rental/RentalRequestCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Rental Requests",
  description: "View all your rental requests and their status",
};

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const requests = await prisma.rentalRequest.findMany({
    where: { requesterId: session.user.id },
    include: {
      item: {
        select: { id: true, name: true, imageUrl: true },
        include: { owner: { select: { id: true, name: true, image: true } } },
      },
      requester: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const groupedRequests = {
    pending: requests.filter((r) => r.status === "pending"),
    approved: requests.filter((r) => r.status === "approved"),
    declined: requests.filter((r) => r.status === "declined"),
    returned: requests.filter((r) => r.status === "returned"),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Rental Requests</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of items you&apos;ve requested to rent.
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title="No rental requests yet"
          description="Browse available items and submit your first rental request."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRequests).map(([status, reqs]) => {
            if (reqs.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="text-lg font-semibold text-foreground capitalize mb-4">
                  {status} ({reqs.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reqs.map((req) => (
                    <RentalRequestCard
                      key={req.id}
                      request={req as unknown as Parameters<typeof RentalRequestCard>[0]["request"]}
                      isOwnerView={false}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
