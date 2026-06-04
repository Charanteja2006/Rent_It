"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import Link from "next/link";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (session?.user?.name) {
      reset({ name: session.user.name });
    }
  }, [session, reset]);

  if (status === "loading") {
    return (
      <div className="max-w-lg mx-auto py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile");

      // Update the session with new name
      await update({ name: data.name });
      toast.success("Profile updated successfully!");
      router.push(`/profile/${session?.user?.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      "w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground",
      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
      hasError ? "border-destructive" : "border-input"
    );

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/profile/${session?.user?.id}`}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">Update your public profile information</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
        {/* Current Avatar Preview */}
        <div className="flex items-center gap-4">
          <UserAvatar
            name={session?.user?.name || "User"}
            image={session?.user?.image}
            size="xl"
          />
          <div>
            <p className="font-semibold text-foreground">{session?.user?.name}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} id="profile-edit-form" className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              {...register("name")}
              placeholder="Your full name"
              autoComplete="name"
              className={inputClass(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={session?.user?.email || ""}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-input bg-muted text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/profile/${session?.user?.id}`}
              className="flex-1 flex items-center justify-center py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !isDirty}
              id="profile-save-btn"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
