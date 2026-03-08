import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Users, IndianRupee, Star } from "lucide-react";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  avgRating: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, avgRating: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("id, total", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("reviews").select("rating"),
    ]).then(([ordersRes, profilesRes, reviewsRes]) => {
      const orders = ordersRes.data ?? [];
      const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const ratings = reviewsRes.data ?? [];
      const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

      setStats({
        totalOrders: ordersRes.count ?? orders.length,
        totalRevenue: revenue,
        totalUsers: profilesRes.count ?? 0,
        avgRating: Math.round(avg * 10) / 10,
      });
    });
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-accent" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Avg Rating", value: stats.avgRating || "—", icon: Star, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="text-xl font-display font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <c.icon className={`h-4 w-4 ${c.color}`} />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{c.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
