import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createItemSchema } from "@/lib/validations/item";

export const dynamic = "force-dynamic";

// GET /api/items - list items with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const sort = searchParams.get("sort") || "newest";
    const ownerId = searchParams.get("ownerId") || undefined;

    const orderBy =
      sort === "price_asc"
        ? { rentPerDay: "asc" as const }
        : sort === "price_desc"
        ? { rentPerDay: "desc" as const }
        : { createdAt: "desc" as const };

    const items = await prisma.item.findMany({
      where: {
        ...(ownerId ? { ownerId } : { isAvailable: true }),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(tags.length > 0 ? { tags: { hasSome: tags } } : {}),
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
      },
      orderBy,
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("[ITEMS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// POST /api/items - create a new item listing
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, description, imageUrl, tags, rentPerDay, availableFrom, availableUntil } =
      parsed.data;

    const item = await prisma.item.create({
      data: {
        name,
        description,
        imageUrl,
        tags,
        rentPerDay,
        ownerId: session.user.id,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error("[ITEMS_POST]", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
