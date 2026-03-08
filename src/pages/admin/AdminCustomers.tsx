import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface CustomerRow extends Profile {
  order_count?: number;
  total_spent?: number;
  orders?: Tables<"orders">[];
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!profiles) return;

    const enriched: CustomerRow[] = [];
    for (const p of profiles) {
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", p.user_id)
        .order("created_at", { ascending: false })
        .limit(10);

      enriched.push({
        ...p,
        order_count: orders?.length ?? 0,
        total_spent: orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0,
        orders: orders ?? [],
      });
    }
    setCustomers(enriched);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) =>
    (c.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">Customers</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spent</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <>
                  <tr key={c.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/30" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    <td className="px-4 py-3 font-medium text-foreground">{c.full_name || "Unnamed"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-foreground">{c.order_count}</td>
                    <td className="px-4 py-3 text-foreground font-medium">₹{(c.total_spent ?? 0).toFixed(0)}</td>
                    <td className="px-4 py-3">
                      {expandedId === c.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr key={`${c.id}-detail`}>
                      <td colSpan={6} className="px-4 py-3 bg-muted/20">
                        {(c.orders?.length ?? 0) > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Recent Orders</p>
                            {c.orders?.map((o) => (
                              <div key={o.id} className="flex items-center gap-4 text-xs">
                                <span className="font-medium text-foreground">#WR-{o.id.slice(0, 6).toUpperCase()}</span>
                                <Badge variant="secondary" className="text-[10px]">{o.status}</Badge>
                                <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                                <span className="text-foreground font-medium">₹{Number(o.total).toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No orders yet</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
