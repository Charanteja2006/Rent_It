import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createItemSchema } from "@/lib/validations/item";

// GET /api/items — list items with optional search, tags, sort
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tagsParam = searchParams.get("tags") || "";
    const sort = searchParams.get("sort") || "newest";

    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    let orderBy: Record<string, unknown> = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { rentPerDay: "asc" };
    if (sort === "price_desc") orderBy = { rentPerDay: "desc" };

    const items = await prisma.item.findMany({
      where,
      orderBy,
      include: {
        owner: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("[ITEMS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// POST /api/items — create a new item listing
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, imageUrl, tags, rentPerDay, availableFrom, availableUntil } =
      parsed.data;

    const item = await prisma.item.create({
      data: {
        ownerId: session.user.id,
        name,
        description,
        imageUrl,
        tags,
        rentPerDay,
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
