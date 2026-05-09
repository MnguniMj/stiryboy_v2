import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Amazon India Clone | Modern Full-Stack Marketplace",
    template: "%s | Amazon India Clone"
  },
  description:
    "A modern full-stack Amazon India-inspired ecommerce app built with Next.js 15, TypeScript, Tailwind CSS, MongoDB, Prisma, NextAuth, and Stripe.",
  keywords: ["Amazon clone", "Next.js ecommerce", "MongoDB Prisma", "Stripe checkout", "NextAuth"],
  openGraph: {
    title: "Amazon India Clone",
    description: "Portfolio-grade ecommerce marketplace with cart, checkout, dashboard, admin panel, and responsive UI.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
