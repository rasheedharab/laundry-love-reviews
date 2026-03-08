import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const statuses = ["pending", "confirmed", "in-progress", "completed", "cancelled"];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700",
  confirmed: "bg-blue-500/10 text-blue-700",
  "in-progress": "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};

interface Outlet { id: string; name: string; }

interface OrderRow extends Tables<"orders"> {
  profile?: Tables<"profiles"> | null;
  items?: Tables<"order_items">[];
  outlet_id?: string | null;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    const { data: rawOrders } = await query;
    if (!rawOrders) { setOrders([]); return; }

    // Enrich with profiles and items
    const enriched: OrderRow[] = [];
    const userIds = [...new Set(rawOrders.map((o) => o.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    const orderIds = rawOrders.map((o) => o.id);
    const { data: items } = await supabase.from("order_items").select("*").in("order_id", orderIds);
    const itemMap = new Map<string, Tables<"order_items">[]>();
    (items ?? []).forEach((i) => {
      const arr = itemMap.get(i.order_id) ?? [];
      arr.push(i);
      itemMap.set(i.order_id, arr);
    });

    for (const o of rawOrders) {
      enriched.push({
        ...o,
        profile: profileMap.get(o.user_id) ?? null,
        items: itemMap.get(o.id) ?? [],
      });
    }
    setOrders(enriched);
  };

  const fetchOutlets = async () => {
    const { data } = await (supabase as any).from("outlets").select("id, name").eq("is_active", true);
    setOutlets(data ?? []);
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);
  useEffect(() => { fetchOutlets(); }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Status → ${newStatus}`);
    fetchOrders();
  };

  const assignOutlet = async (orderId: string, outletId: string) => {
    const { error } = await (supabase as any).from("orders").update({ outlet_id: outletId }).eq("id", orderId);
    if (error) { toast.error(error.message); return; }
    toast.success("Outlet assigned");
    fetchOrders();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">Orders</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outlet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">#WR-{o.id.slice(0, 6).toUpperCase()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.profile?.full_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-foreground font-medium">₹{Number(o.total).toFixed(0)}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className={statusColor[o.status] ?? ""}>{o.status}</Badge></td>
                    <td className="px-4 py-3">
                      <Select value={(o as any).outlet_id ?? "none"} onValueChange={(v) => assignOutlet(o.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Assign" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {outlets.map((out) => <SelectItem key={out.id} value={out.id}>{out.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                      {expandedId === o.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </td>
                  </tr>
                  {expandedId === o.id && (
                    <tr key={`${o.id}-detail`}>
                      <td colSpan={8} className="px-4 py-3 bg-muted/20">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-semibold text-muted-foreground uppercase mb-1">Customer</p>
                            <p className="text-foreground">{o.profile?.full_name || "—"}</p>
                            <p className="text-muted-foreground">{o.profile?.phone || "No phone"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-muted-foreground uppercase mb-1">Payment</p>
                            <p className="text-foreground">{o.payment_method ?? "—"} · {o.payment_status ?? "—"}</p>
                            {o.notes && <p className="text-muted-foreground mt-1">Notes: {o.notes}</p>}
                          </div>
                        </div>
                        {(o.items?.length ?? 0) > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Items</p>
                            <div className="space-y-1">
                              {o.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs">
                                  <span className="text-foreground">{item.tier} × {item.quantity}</span>
                                  <span className="text-foreground font-medium">₹{Number(item.total_price).toFixed(0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {orders.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
