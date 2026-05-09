"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { useCartStore } from "@/components/providers/cart-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);

  function addToCart() {
    addItem(product, 1);
    toast.success("Added to cart", {
      description: product.title
    });
  }

  function addToWishlist() {
    toast.success("Saved to wishlist", {
      description: "Sign in to sync wishlist across devices."
    });
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-amber-200 hover:shadow-soft dark:border-white/10 dark:bg-slate-900"
    >
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.discount > 0 && <Badge tone="deal">{product.discount}% off</Badge>}
          {product.isPrime && <Badge tone="prime">prime</Badge>}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            addToWishlist();
          }}
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-700 shadow-sm transition hover:text-red-500 dark:bg-slate-950/90 dark:text-slate-200"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 text-xs font-bold uppercase text-slate-500">{product.brand}</div>
        <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-11 font-semibold text-slate-950 hover:text-amazon-teal dark:text-white">
          {product.title}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} className="mt-3" />

        {!compact && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-end gap-2">
            <span className="text-xl font-extrabold text-slate-950 dark:text-white">{formatPrice(product.price)}</span>
            <span className="text-sm text-slate-500 line-through">{formatPrice(product.mrp)}</span>
          </div>
          <p className="mt-1 text-xs font-medium text-amazon-green">FREE delivery by tomorrow</p>
          <Button onClick={addToCart} className="mt-3 w-full" size="sm">
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
