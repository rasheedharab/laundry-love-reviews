import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, ChevronRight, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-accent/10 text-accent",
  "in-progress": "bg-accent/10 text-accent",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusDot: Record<string, string> = {
  pending: "bg-muted-foreground",
  confirmed: "bg-accent",
  "in-progress": "bg-accent",
  completed: "bg-primary",
  cancelled: "bg-destructive",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Tables<"orders">[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
  }, [user]);

  const activeOrders = orders.filter(o => !["completed", "cancelled"].includes(o.status));
  const historyOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status));

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="mb-1 text-2xl font-display font-bold text-foreground">My Orders</h1>
      <p className="mb-6 text-sm text-muted-foreground">Track your garment care journey</p>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Button onClick={() => navigate("/services")} variant="outline" className="rounded-2xl">
            Browse Services
          </Button>
        </div>
      ) : (
        <>
          {/* ACTIVE */}
          {activeOrders.length > 0 && (
            <div className="mb-6">
              <p className="section-label mb-3">ACTIVE</p>
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold font-display text-foreground">
                        #WR-{order.id.slice(0, 6).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${statusDot[order.status] || statusDot.pending}`} />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {order.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-base font-bold text-foreground">₹{order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/track-order/${order.id}`)}
                        className="flex-1 h-10 rounded-xl bg-foreground text-primary-foreground text-xs font-semibold uppercase tracking-wider hover:bg-foreground/90"
                      >
                        Track Status
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {historyOrders.length > 0 && (
            <div>
              <p className="section-label mb-3">HISTORY</p>
              <div className="space-y-2">
                {historyOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">#WR-{order.id.slice(0, 6).toUpperCase()}</p>
                        <Badge className="text-[8px] px-1.5 py-0 h-3.5 bg-primary/10 text-primary border-0 uppercase tracking-wider">
                          Done
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ₹{order.total.toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
