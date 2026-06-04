import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRentalRequestSchema } from "@/lib/validations/rental";

export const dynamic = "force-dynamic";

// PATCH /api/rental-requests/[id] - approve, decline, or mark returned (owner only)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: params.id },
      include: { item: true },
    });

    if (!rentalRequest) {
      return NextResponse.json({ error: "Rental request not found" }, { status: 404 });
    }

    // Only the item owner can approve/decline/mark returned
    if (rentalRequest.item.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateRentalRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.rentalRequest.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      include: {
        item: { include: { owner: { select: { id: true, name: true, image: true } } } },
        requester: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[RENTAL_REQUEST_PATCH]", error);
    return NextResponse.json({ error: "Failed to update rental request" }, { status: 500 });
  }
}
