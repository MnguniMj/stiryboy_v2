"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setItems(data);
  }, []);

  if (!items.length) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/products/${item.slug}`}>
            <div className="border p-3 rounded hover:shadow cursor-pointer">
              <img
                src={item.image}
                alt={item.title}
                className="h-32 w-full object-cover rounded"
              />
              <p className="text-sm mt-2 line-clamp-2">{item.title}</p>
              <p className="font-semibold mt-1">₹{item.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}