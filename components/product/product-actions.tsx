"use client";

import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useCartStore } from "@/components/providers/cart-store";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  function addToCart() {
    addItem(product, quantity);
    toast.success("Added to cart", {
      description: `${quantity} x ${product.title}`
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-300">Quantity</p>
      <div className="mt-2 inline-flex h-11 items-center overflow-hidden rounded-full border border-slate-200 dark:border-white/10">
        <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4" aria-label="Decrease quantity">
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-10 text-center font-black">{quantity}</span>
        <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="px-4" aria-label="Increase quantity">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <Button onClick={addToCart}>
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </Button>
        <Link
          href="/checkout"
          onClick={addToCart}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amazon-orange px-4 text-sm font-bold text-slate-950 hover:bg-[#ed8c00]"
        >
          <Zap className="h-4 w-4" />
          Buy now
        </Link>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast.success("Saved to wishlist", {
              description: "Sign in to sync wishlist across devices."
            })
          }
        >
          <Heart className="h-4 w-4" />
          Add to wishlist
        </Button>
      </div>
    </div>
  );
}
