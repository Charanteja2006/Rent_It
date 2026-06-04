import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Always render dynamically — this route reads auth headers at request time
export const dynamic = "force-dynamic";

// GET /api/rental-requests/incoming — get all requests for items owned by current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.rentalRequest.findMany({
      where: {
        item: { ownerId: session.user.id },
      },
      include: {
        item: {
          select: { id: true, name: true, imageUrl: true },
        },
        requester: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error("[INCOMING_REQUESTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
