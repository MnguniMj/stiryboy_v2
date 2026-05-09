"use client";

import { Loader2, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { useCartStore } from "@/components/providers/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function CheckoutForm() {
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const [loading, setLoading] = useState(false);
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user) {
      toast.error("Please sign in before checkout.");
      return;
    }

    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          address: {
            fullName: String(formData.get("fullName")),
            phone: String(formData.get("phone")),
            line1: String(formData.get("line1")),
            line2: String(formData.get("line2")),
            city: String(formData.get("city")),
            state: String(formData.get("state")),
            pincode: String(formData.get("pincode"))
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-3xl font-black tracking-normal text-slate-950 dark:text-white">No items to checkout</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Your cart needs at least one product before payment.</p>
        <Link href="/search" className="mt-6 inline-flex h-11 items-center rounded-md bg-amazon-gold px-5 text-sm font-bold text-slate-950">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-5 lg:grid-cols-[1fr_380px]">
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <MapPin className="h-6 w-6 text-amazon-orange" />
          <div>
            <h1 className="text-3xl font-black tracking-normal text-slate-950 dark:text-white">Shipping address</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Payments are handled with Stripe test mode.</p>
          </div>
        </div>

        {status !== "loading" && !session?.user && (
          <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Please <Link href="/login?callbackUrl=/checkout" className="font-bold underline">sign in</Link> to place an order.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["fullName", "Full name"],
            ["phone", "Mobile number"],
            ["line1", "Flat, house no., building"],
            ["line2", "Area, street, sector"],
            ["city", "Town/City"],
            ["state", "State"],
            ["pincode", "Pincode"]
          ].map(([name, label]) => (
            <label key={name} className={name === "line1" || name === "line2" ? "sm:col-span-2" : ""}>
              <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
              <input
                name={name}
                required={name !== "line2"}
                className="h-11 w-full rounded-md border border-slate-200 bg-transparent px-3 outline-none focus:border-amazon-orange dark:border-white/10"
              />
            </label>
          ))}
        </div>

        <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={loading || !session?.user}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue to Stripe
        </Button>
      </form>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-900">
        <h2 className="text-xl font-black tracking-normal text-slate-950 dark:text-white">Order summary</h2>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                <Image src={item.product.images[0]} alt={item.product.title} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold">{item.product.title}</p>
                <p className="text-xs text-slate-500">Qty {item.quantity}</p>
              </div>
              <strong className="text-sm">{formatPrice(item.product.price * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm dark:border-white/10">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <strong>{shipping === 0 ? "FREE" : formatPrice(shipping)}</strong>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <strong>{formatPrice(tax)}</strong>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-black">Total</span>
            <strong className="text-amazon-orange">{formatPrice(total)}</strong>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs font-semibold text-amazon-green dark:bg-emerald-950/40">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Secure checkout with Stripe. Use test cards while developing.
        </p>
      </aside>
    </div>
  );
}
