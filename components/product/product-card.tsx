"use client";

import { motion } from "framer-motion";
import { BarChart2, Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useCartStore } from "@/components/providers/cart-store";
import { useCompareStore } from "@/components/providers/compare-store";
import { useWishlistStore } from "@/components/providers/wishlist-store";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  sponsored?: boolean;
};

export function ProductCard({ product, compact = false, sponsored = false }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const addCompare = useCompareStore((s) => s.add);
  const [adding, setAdding] = useState(false);

  const inStock = product.stock > 0;

  function addToCart() {
    setAdding(true);
    addItem(product, 1);
    toast.success("Added to cart", { description: product.title });
    setTimeout(() => setAdding(false), 400);
  }

  function buyNow() {
    addItem(product, 1);
    router.push("/checkout");
  }

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900"
    >
      {(sponsored || product.isSponsored) && (
        <span className="absolute right-3 top-3 z-20 text-[10px] text-slate-500">
          Sponsored
        </span>
      )}

      <div className="relative overflow-hidden rounded-t-2xl bg-white dark:bg-slate-900">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3]">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-contain p-4 transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5">
            {product.discount > 0 && (
              <Badge tone="deal">{product.discount}% off</Badge>
            )}
            {product.isPrime && <Badge tone="prime">prime</Badge>}
            {product.isFlashDeal && <Badge tone="deal">⚡ Deal</Badge>}
          </div>
        </Link>

        <div className="absolute right-2 top-2 z-20 flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
              toast.success(
                isWishlisted ? "Removed from wishlist" : "Saved to wishlist",
              );
            }}
            className={cn(
              "rounded-full bg-white/95 p-1.5 shadow-sm dark:bg-slate-900",
              isWishlisted && "text-red-500",
            )}
            aria-label="Wishlist"
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const ok = addCompare(product);
              toast[ok ? "success" : "error"](
                ok ? "Added to compare" : "Compare list full (max 4)",
              );
            }}
            className="rounded-full bg-white/95 p-1.5 shadow-sm dark:bg-slate-900"
            aria-label="Compare"
          >
            <BarChart2 className="h-4 w-4" />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="rounded-full bg-white/95 p-1.5 shadow-sm dark:bg-slate-900"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {product.brand}
          </p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
              {product.title}
            </h3>
          </Link>
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        <div className="mt-auto space-y-3">
          <span className="block text-2xl font-bold text-slate-950 dark:text-white">
            {formatPrice(product.price)}
          </span>

          {!compact && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={buyNow}
                disabled={!inStock}
                className="h-10 w-full rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:pointer-events-none disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={addToCart}
                disabled={!inStock || adding}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-slate-950 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400/50 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <motion.span
                  animate={adding ? { scale: [1, 1.2, 1] } : {}}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </motion.span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
