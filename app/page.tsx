import { CategoryTiles } from "@/components/home/category-tiles";
import { DealShelf } from "@/components/home/deal-shelf";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { PrimePanel } from "@/components/home/prime-panel";
import { ProductShowcase } from "@/components/home/product-showcase";
import { categories, products } from "@/lib/data";
import { getFeaturedProducts } from "@/lib/products";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const electronics = products.filter((product) => product.category === "Electronics" || product.category === "Mobiles").slice(0, 5);
  const home = products.filter((product) => product.category === "Home & Kitchen" || product.category === "Appliances").slice(0, 5);

  return (
    <div className="space-y-10 pb-10">
      <HeroCarousel />
      <CategoryTiles categories={categories} />
      <DealShelf products={products} />
      <ProductShowcase
        title="Featured for Indian shoppers"
        subtitle="A responsive product grid with Prime badges, discounts, reviews, and quick cart actions."
        products={featured}
        href="/search"
      />
      <PrimePanel />
      <ProductShowcase
        title="Electronics and mobiles"
        subtitle="Launches, upgrades, audio gear, and screen-time essentials."
        products={electronics}
        href="/search?category=Electronics"
      />
      <ProductShowcase
        title="Home, kitchen, and appliances"
        subtitle="Useful everyday products for apartments, home offices, and family kitchens."
        products={home}
        href="/search?category=Home%20%26%20Kitchen"
      />
    </div>
  );
}
