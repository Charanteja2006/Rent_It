"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home, Package, LayoutDashboard, MessageSquare, ClipboardList,
  LogOut, LogIn, UserPlus, Menu, X, Moon, Sun
} from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Browse", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authRequired: true },
  { href: "/messages", label: "Messages", icon: MessageSquare, authRequired: true },
  { href: "/requests", label: "My Requests", icon: ClipboardList, authRequired: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border glass">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" id="navbar-logo" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-1.5 rounded-lg gradient-brand">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-gradient">RentIt</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((l) => !l.authRequired || session)
              .map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  id={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    pathname === href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              id="dark-mode-toggle"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {session ? (
              <>
                <Link
                  href="/items/new"
                  id="nav-create-listing"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Package className="h-4 w-4" />
                  List Item
                </Link>
                <Link
                  href={`/profile/${session.user?.id}`}
                  id="nav-profile-link"
                  className="hidden md:block"
                >
                  <UserAvatar
                    name={session.user?.name || "User"}
                    image={session.user?.image}
                    size="sm"
                    className="hover:ring-2 hover:ring-primary/40 transition-all"
                  />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  id="nav-signout"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  id="nav-login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  id="nav-register"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              id="mobile-menu-toggle"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 pb-4 border-t border-border space-y-1 animate-fade-in">
            {navLinks
              .filter((l) => !l.authRequired || session)
              .map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    pathname === href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}

            {session ? (
              <>
                <Link
                  href="/items/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary"
                >
                  <Package className="h-4 w-4" />
                  List New Item
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground">
                  <LogIn className="h-4 w-4" />Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary">
                  <UserPlus className="h-4 w-4" />Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
