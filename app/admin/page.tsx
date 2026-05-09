import { Boxes, IndianRupee, PackageCheck, UsersRound } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin Overview"
};

export default function AdminPage() {
  const revenue = products.slice(0, 6).reduce((sum, product) => sum + product.price * 3, 0);

  return (
    <AdminShell title="Overview">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Products", value: products.length, icon: Boxes },
            { label: "Orders", value: 128, icon: PackageCheck },
            { label: "Users", value: "2.4k", icon: UsersRound },
            { label: "Revenue", value: formatPrice(revenue), icon: IndianRupee }
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <Icon className="h-6 w-6 text-amazon-orange" />
                <p className="mt-3 text-xs font-black uppercase text-slate-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-black tracking-normal text-slate-950 dark:text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <h2 className="text-2xl font-black tracking-normal text-slate-950 dark:text-white">Admin workspace</h2>
          <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
            Manage product catalogues, track order status, and adjust user roles. The API routes enforce admin sessions, while the UI keeps demo data visible for portfolio review.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Catalog health", "Fulfilment velocity", "User trust"].map((item, index) => (
              <div key={item} className="rounded-lg bg-slate-100 p-4 dark:bg-white/10">
                <p className="text-sm font-black text-slate-950 dark:text-white">{item}</p>
                <div className="mt-3 h-2 rounded-full bg-white dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-amazon-orange" style={{ width: `${86 - index * 12}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
