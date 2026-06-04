import Link from "next/link";
import { PackageSearch, Home } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-muted">
            <PackageSearch className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-gradient">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            id="not-found-home-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
