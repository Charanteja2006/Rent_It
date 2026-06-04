import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateItemSchema } from "@/lib/validations/item";

// GET /api/items/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true, image: true, createdAt: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("[ITEM_GET]", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

// PATCH /api/items/[id] — update item (owner only)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.item.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { availableFrom, availableUntil, ...rest } = parsed.data;

    const updated = await prisma.item.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(availableFrom !== undefined && {
          availableFrom: availableFrom ? new Date(availableFrom) : null,
        }),
        ...(availableUntil !== undefined && {
          availableUntil: availableUntil ? new Date(availableUntil) : null,
        }),
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[ITEM_PATCH]", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE /api/items/[id] — delete item (owner only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.item.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.item.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { message: "Item deleted successfully" } });
  } catch (error) {
    console.error("[ITEM_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
