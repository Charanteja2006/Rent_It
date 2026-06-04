"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      "w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground",
      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
      hasError ? "border-destructive" : "border-input"
    );

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5 space-y-6">
      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || isSubmitting}
        id="google-signin-btn"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-all disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Credentials form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</label>
          <input
            id="login-email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass(!!errors.email)}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              autoComplete="current-password"
              className={cn(inputClass(!!errors.password), "pr-10")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || googleLoading}
          id="login-submit-btn"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
        >
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// Fallback shown while Suspense loads (prevents static render crash)
function LoginFormFallback() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5 space-y-4 animate-pulse">
      <div className="h-12 bg-muted rounded-xl" />
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <div className="w-4 h-3 bg-muted rounded" />
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="space-y-3">
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function LoginPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
        </div>

        {/* Suspense boundary required for useSearchParams in Next.js 14 App Router */}
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" id="goto-register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
