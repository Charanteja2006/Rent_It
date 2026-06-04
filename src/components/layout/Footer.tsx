import Link from "next/link";
import { Package, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="p-1.5 rounded-lg gradient-brand">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-gradient">RentIt</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A community-driven peer-to-peer item rental platform. Borrow, lend, connect.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Platform</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Browse Items" },
                { href: "/items/new", label: "List an Item" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/messages", label: "Messages" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">How it Works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>List your item with photos & price</li>
              <li>Renters submit rental requests</li>
              <li>Approve & coordinate pickup</li>
              <li>Exchange happens in person</li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RentIt. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            No payment processing — all transactions happen in person.
          </p>
        </div>
      </div>
    </footer>
  );
}
