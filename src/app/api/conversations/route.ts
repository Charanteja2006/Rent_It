import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createConversationSchema } from "@/lib/validations/message";

// GET /api/conversations — list all conversations for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { renterId: session.user.id },
        ],
      },
      include: {
        item: {
          select: { id: true, name: true, imageUrl: true },
        },
        owner: { select: { id: true, name: true, image: true } },
        renter: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error("[CONVERSATIONS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// POST /api/conversations — get or create a conversation (idempotent)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { itemId } = parsed.data;

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot message yourself as the owner" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.upsert({
      where: { itemId_renterId: { itemId, renterId: session.user.id } },
      create: { itemId, ownerId: item.ownerId, renterId: session.user.id },
      update: {},
      include: {
        item: { select: { id: true, name: true, imageUrl: true } },
        owner: { select: { id: true, name: true, image: true } },
        renter: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error("[CONVERSATIONS_POST]", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
