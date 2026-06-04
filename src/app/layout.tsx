import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RentIt — Peer-to-Peer Item Rental Platform",
    template: "%s | RentIt",
  },
  description:
    "RentIt is a community-driven platform where you can list items for rent, browse available items, and connect with owners directly.",
  keywords: ["rental", "peer-to-peer", "items", "rent", "community"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter), Inter, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
