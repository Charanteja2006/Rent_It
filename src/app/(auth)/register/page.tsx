"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      "w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground",
      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
      hasError ? "border-destructive" : "border-input"
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl justify-center">
            <div className="p-2 rounded-xl gradient-brand">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-gradient">RentIt</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground text-sm">Join the RentIt community today</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-sm font-medium text-foreground">Full Name</label>
              <input
                id="register-name"
                type="text"
                {...register("name")}
                placeholder="John Doe"
                autoComplete="name"
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-sm font-medium text-foreground">Email</label>
              <input
                id="register-email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={cn(inputClass(!!errors.password), "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-confirm" className="text-sm font-medium text-foreground">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                {...register("confirmPassword")}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={inputClass(!!errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="register-submit-btn"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Creating account...</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" id="goto-login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
