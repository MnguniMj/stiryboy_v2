"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCartStore } from "@/components/providers/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-slate-900">
          <ShoppingBag className="mx-auto h-14 w-14 text-amazon-orange" />
          <h1 className="mt-5 text-3xl font-black tracking-normal text-slate-950 dark:text-white">Your cart is empty</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Add deals, daily essentials, or wishlist favourites before checkout.</p>
          <Link href="/search" className="mt-6 inline-flex h-11 items-center rounded-md bg-amazon-gold px-5 text-sm font-bold text-slate-950 hover:bg-[#f5a742]">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <div className="mb-5 flex items-end justify-between border-b border-slate-200 pb-4 dark:border-white/10">
          <div>
            <h1 className="text-3xl font-black tracking-normal text-slate-950 dark:text-white">Shopping Cart</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{items.length} item groups in your basket</p>
          </div>
          <span className="hidden text-sm font-semibold text-slate-500 sm:block">Price</span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {items.map(({ product, quantity }) => (
            <article key={product.id} className="grid gap-4 py-5 sm:grid-cols-[160px_1fr_auto]">
              <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
                <Image src={product.images[0]} alt={product.title} fill sizes="160px" className="object-cover" />
              </Link>
              <div>
                <Link href={`/products/${product.slug}`} className="text-lg font-bold text-slate-950 hover:text-amazon-teal dark:text-white">
                  {product.title}
                </Link>
                <p className="mt-1 text-sm text-amazon-green">In stock and eligible for FREE delivery</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{product.brand} • {product.category}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex h-10 items-center overflow-hidden rounded-full border border-slate-200 dark:border-white/10">
                    <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="px-3" aria-label="Decrease quantity">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-10 text-center text-sm font-bold">{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} className="px-3" aria-label="Increase quantity">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-amazon-teal hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-xl font-black text-slate-950 dark:text-white">{formatPrice(product.price * quantity)}</div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-900">
        <h2 className="text-xl font-black tracking-normal text-slate-950 dark:text-white">Order Summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <strong>{shipping === 0 ? "FREE" : formatPrice(shipping)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Estimated GST</span>
            <strong>{formatPrice(tax)}</strong>
          </div>
          <div className="border-t border-slate-200 pt-3 text-base dark:border-white/10">
            <div className="flex justify-between">
              <span className="font-bold">Order total</span>
              <strong className="text-amazon-orange">{formatPrice(total)}</strong>
            </div>
          </div>
        </div>
        <Link href="/checkout" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-amazon-gold px-4 text-sm font-bold text-slate-950 hover:bg-[#f5a742]">
          Proceed to checkout
        </Link>
        <Button variant="outline" className="mt-3 w-full" onClick={() => items.forEach((item) => removeItem(item.product.id))}>
          Clear cart
        </Button>
      </aside>
    </div>
  );
}
