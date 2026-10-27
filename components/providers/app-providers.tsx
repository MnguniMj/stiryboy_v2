"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { useCartStore } from "@/components/providers/cart-store";
import { useCompareStore } from "@/components/providers/compare-store";
import { useDeliveryStore } from "@/components/providers/delivery-store";
import { useSearchHistoryStore } from "@/components/providers/search-history-store";
import { useWishlistStore } from "@/components/providers/wishlist-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Persisted stores opt out of automatic hydration (skipHydration) so the
  // first client render matches the server HTML. Rehydrate from localStorage
  // after mount to avoid hydration mismatches.
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useCompareStore.persist.rehydrate();
    void useDeliveryStore.persist.rehydrate();
    void useSearchHistoryStore.persist.rehydrate();
    void useWishlistStore.persist.rehydrate();
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
