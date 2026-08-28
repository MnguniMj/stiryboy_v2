"use client";

import {
  ChevronDown,
  Globe,
  Menu,
  Moon,
  Package,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchBar } from "@/components/layout/search-bar";
import { useCartStore } from "@/components/providers/cart-store";
import { useDeliveryStore } from "@/components/providers/delivery-store";
import { categories } from "@/lib/data";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const cartCount = useCartStore((s) => s.count());
  useDeliveryStore();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [lang, setLang] = useState("EN");
  const currentCategory = searchParams.get("category") ?? "All";

  useEffect(() => setMounted(true), []);

  function isActiveLink(href: string, params?: Record<string, string>) {
    const parts = href.split("?");
    const pathPart = parts[0] ?? href;
    if (pathname !== pathPart) return false;
    if (!params) return true;
    return Object.entries(params).every(
      ([key, value]) => searchParams.get(key) === value,
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-amazon-navy text-white shadow-sticky transition-shadow">
      <div className="hidden w-full bg-amazon-light text-white lg:block">
        <nav className="mx-auto flex max-w-[1500px] w-full items-center justify-center gap-1 overflow-x-auto px-2 py-1 text-[13px]">
          {(() => {
            const linkBase =
              "px-3 py-0.5 font-semibold transition-colors shrink-0";
            const activeClass = "text-amazon-orange";
            const idleClass = "text-white hover:text-slate-200";
            const links = [
              { label: "Parcel delivery", href: "/parcel-delivery" },
              { label: "Shop", href: "/search" },
              { label: "Track order", href: "/track-order" },
              { label: "Sell", href: "/sell" },
              { label: "Become a driver", href: "/become-a-driver" },
              { label: "Become a biker", href: "/become-a-biker" },
            ];

            return (
              <>
                {links.map((link) => {
                  const active = isActiveLink(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`${linkBase} ${
                        active ? activeClass : idleClass
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </>
            );
          })()}
        </nav>
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-2 py-1.5 sm:px-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-sm p-2 hover:outline hover:outline-1 hover:outline-white/80 lg:hidden"
            aria-label="Open menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/"
            className="flex shrink-0 items-end border border-transparent px-1 py-1 hover:border-white"
            aria-label="Amazon.in home"
          >
            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              StiryBoy
            </span>
          </Link>

          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setLocationOpen((v) => !v)}
              className="flex max-w-[160px] flex-col rounded-sm border border-transparent px-1 py-0.5 text-left hover:border-white"
            >
              <span className="flex items-center gap-0.5 text-[11px] text-slate-300">
                <Menu className="h-3 w-3" />
                Search by category
              </span>
              <span className="truncate text-sm font-bold">
                {currentCategory}
              </span>
            </button>
            {locationOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md border border-slate-200 bg-white p-4 text-slate-900 shadow-dropdown">
                <p className="text-sm font-bold">All Categories</p>
                <p className="mt-1 text-xs text-slate-600">
                  Browse products by category
                </p>
                <div className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto">
                  <button
                    type="button"
                    className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-amber-50"
                    onClick={() => {
                      router.push("/search");
                      setLocationOpen(false);
                    }}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-amber-50"
                      onClick={() => {
                        router.push(
                          `/search?category=${encodeURIComponent(category)}`,
                        );
                        setLocationOpen(false);
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <SearchBar
            className="hidden min-w-0 md:flex md:flex-[2.8] lg:flex-[3.6] xl:flex-[4.2]"
            initialQuery={searchParams.get("q") ?? ""}
          />

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setLang((l) => (l === "EN" ? "HI" : "EN"))}
              className="hidden items-center gap-0.5 rounded-sm border border-transparent px-2 py-1 text-xs hover:border-white lg:flex"
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
              <span className="font-bold">{lang}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden rounded-sm border border-transparent p-2 hover:border-white sm:inline-flex"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <div className="group relative hidden lg:block">
              <Link
                href={session ? "/dashboard/profile" : "/login"}
                className="block rounded-sm border border-transparent px-1 py-0.5 hover:border-white"
              >
                <span className="text-[11px] text-slate-300">
                  Hello, {session?.user?.name?.split(" ")[0] ?? "sign in"}
                </span>
                <span className="flex items-center gap-0.5 text-sm font-bold">
                  Account & Lists
                  <ChevronDown className="h-3 w-3" />
                </span>
              </Link>
              <div className="invisible absolute right-0 top-full w-52 translate-y-1 rounded-md border border-slate-200 bg-white p-2 text-slate-900 opacity-0 shadow-dropdown transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                {session ? (
                  <>
                    <Link
                      className="block rounded px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-white/10"
                      href="/dashboard/profile"
                    >
                      Your Account
                    </Link>
                    <Link
                      className="block rounded px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-white/10"
                      href="/dashboard/orders"
                    >
                      Your Orders
                    </Link>
                    <Link
                      className="block rounded px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-white/10"
                      href="/dashboard/wishlist"
                    >
                      Wishlist
                    </Link>
                    <Link
                      className="block rounded px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-white/10"
                      href="/prime"
                    >
                      Prime
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        className="block rounded px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-white/10"
                        href="/admin"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-amber-50 dark:hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block rounded bg-amazon-orange px-3 py-2 text-center text-sm font-bold text-slate-950 hover:bg-[#f5a742]"
                    >
                      Sign in
                    </Link>
                    <p className="mt-2 px-3 text-xs text-slate-600 dark:text-slate-400">
                      New customer?{" "}
                      <Link
                        href="/signup"
                        className="text-amazon-teal hover:underline"
                      >
                        Start here
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            <Link
              href="/cart"
              className="relative flex items-end gap-1 rounded-sm border border-transparent px-1 py-0.5 hover:border-white"
              aria-label={`Cart, ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="h-8 w-8" />
                <span className="absolute -top-1 left-4 min-w-[18px] rounded-full bg-amazon-red px-1 text-center text-xs font-bold text-white">
                  {cartCount}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-2 pb-2 md:hidden">
        <SearchBar compact initialQuery={searchParams.get("q") ?? ""} />
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-amazon-navy p-4 lg:hidden">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <Menu className="h-4 w-4" />
            Search by category · {currentCategory}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/search"
              className="rounded bg-white/10 px-3 py-2"
              onClick={() => setMenuOpen(false)}
            >
              All categories
            </Link>
            <Link
              href="/search?deal=flash"
              className="rounded bg-white/10 px-3 py-2"
              onClick={() => setMenuOpen(false)}
            >
              Deals
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard/profile"
                  className="rounded bg-white/10 px-3 py-2"
                >
                  Account
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="rounded bg-white/10 px-3 py-2"
                >
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded bg-white/10 px-3 py-2 text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="col-span-2 rounded bg-amazon-orange px-3 py-2 text-center font-bold text-slate-950"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 rounded bg-white/10 px-3 py-2"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              Theme
            </button>
            <Link
              href="/prime"
              className="flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-amazon-gold"
            >
              <Package className="h-4 w-4" />
              Prime
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
