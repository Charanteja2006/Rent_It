import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRentalRequestSchema } from "@/lib/validations/rental";

// GET /api/rental-requests — get current user's requests (as renter)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.rentalRequest.findMany({
      where: { requesterId: session.user.id },
      include: {
        item: {
          include: {
            owner: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error("[RENTAL_REQUESTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// POST /api/rental-requests — create a new rental request
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createRentalRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { itemId, startDate, endDate, note } = parsed.data;

    // Verify item exists and is available
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (!item.isAvailable) {
      return NextResponse.json({ error: "Item is not available for rent" }, { status: 400 });
    }
    if (item.ownerId === session.user.id) {
      return NextResponse.json({ error: "You cannot rent your own item" }, { status: 400 });
    }

    // Create rental request
    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        itemId,
        requesterId: session.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        note,
      },
      include: {
        item: { include: { owner: { select: { id: true, name: true, image: true } } } },
        requester: { select: { id: true, name: true, image: true } },
      },
    });

    // Create or retrieve conversation between renter and owner
    await prisma.conversation.upsert({
      where: { itemId_renterId: { itemId, renterId: session.user.id } },
      create: { itemId, ownerId: item.ownerId, renterId: session.user.id },
      update: {},
    });

    return NextResponse.json({ data: rentalRequest }, { status: 201 });
  } catch (error) {
    console.error("[RENTAL_REQUESTS_POST]", error);
    return NextResponse.json({ error: "Failed to create rental request" }, { status: 500 });
  }
}
