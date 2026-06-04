import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { z } from "zod";

export const dynamic = "force-dynamic";

const aiSupportSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      parts: z.string(),
    })
  ).min(1),
});

// POST /api/ai-support — send message to Gemini AI; return response
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = aiSupportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { messages } = parsed.data;
    const model = getGeminiModel();

    // Build history (all messages except the last user message)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.parts }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("[AI_SUPPORT]", error);
    return NextResponse.json(
      { error: "AI support is currently unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
