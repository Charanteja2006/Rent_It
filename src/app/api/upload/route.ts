import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

// POST /api/upload — return a signed Supabase Storage URL for direct client upload
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { filename, contentType } = parsed.data;
    const supabase = createServerSupabaseClient();

    // Namespace files by userId to prevent collisions
    const filePath = `${session.user.id}/${Date.now()}-${filename}`;

    const { data, error } = await supabase.storage
      .from("item-images")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      console.error("[UPLOAD_SIGNED_URL]", error);
      return NextResponse.json(
        { error: "Failed to generate upload URL" },
        { status: 500 }
      );
    }

    const publicUrl = supabase.storage
      .from("item-images")
      .getPublicUrl(filePath).data.publicUrl;

    return NextResponse.json({
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
        publicUrl,
        path: filePath,
      },
    });
  } catch (error) {
    console.error("[UPLOAD]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
