"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, Product } from "@/types";

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const current = items.find((item) => item.product.id === product.id);

        if (current) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + quantity, 20) }
                : item
            )
          });
          return;
        }

        set({ items: [...items, { product, quantity }] });
      },
      removeItem: (productId) =>
        set({
          items: get().items.filter((item) => item.product.id !== productId)
        }),
      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, 20)) } : item
          )
        }),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((total, item) => total + item.product.price * item.quantity, 0),
      count: () => get().items.reduce((total, item) => total + item.quantity, 0)
    }),
    {
      name: "amazon-india-cart"
    }
  )
);
