import RecentlyViewed from "@/components/product/RecentlyViewed";
import TrackView from "@/components/product/TrackView";
import { CheckCircle2, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductActions } from "@/components/product/product-actions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { products, reviews } from "@/lib/data";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images.slice(0, 1)
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5">
      <div className="mb-5 text-sm text-slate-600 dark:text-slate-300">
        <Link href="/" className="hover:text-amazon-teal">Home</Link> /{" "}
        <Link href={`/search?category=${encodeURIComponent(product.category)}`} className="hover:text-amazon-teal">
          {product.category}
        </Link>
      </div>

      {product && <TrackView product={product} />}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)_320px]">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <p className="text-sm font-bold uppercase text-amazon-teal">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 dark:text-white lg:text-4xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} />
            <Badge tone="success">Amazon's Choice</Badge>
          </div>
          <div className="mt-5 border-y border-slate-200 py-5 dark:border-white/10">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black text-slate-950 dark:text-white">{formatPrice(product.price)}</span>
              <span className="text-lg text-slate-500 line-through">{formatPrice(product.mrp)}</span>
              <Badge tone="deal">-{product.discount}%</Badge>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Inclusive of all taxes. EMI starts at {formatPrice(Math.ceil(product.price / 12))}/month.</p>
          </div>

          <p className="mt-5 leading-7 text-slate-700 dark:text-slate-300">{product.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: "FREE delivery" },
              { icon: RotateCcw, label: "7 day replacement" },
              { icon: ShieldCheck, label: "Secure transaction" }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 text-center text-sm font-bold shadow-sm dark:border-white/10 dark:bg-slate-900">
                <Icon className="mx-auto mb-2 h-6 w-6 text-amazon-teal" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <ProductActions product={product} />
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="flex gap-2 text-amazon-green">
              <CheckCircle2 className="h-5 w-5" />
              <strong>In stock</strong>
            </div>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Ships from Amazon Fulfilment India. Sold by Cloudtail-style demo seller.</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading title="Customer reviews" subtitle="Dummy review data is included so the page feels complete before MongoDB seeding." />
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <Rating value={review.rating} />
              <h3 className="mt-3 font-bold text-slate-950 dark:text-white">{review.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.comment}</p>
              <p className="mt-4 text-xs font-bold uppercase text-slate-500">{review.name}</p>
            </article>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeading title="More like this" href={`/search?category=${encodeURIComponent(product.category)}`} />
          <ProductGrid products={related} />
        </section>
      )}
      <RecentlyViewed />
      
    </div>
  );
}
