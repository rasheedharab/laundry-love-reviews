import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/10 text-primary",
  "in-progress": "bg-accent/10 text-accent",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
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

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="mb-1 text-2xl font-display font-bold text-foreground">My Orders</h1>
      <p className="mb-6 text-sm text-muted-foreground">Track your garment care journey</p>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Button onClick={() => navigate("/services")} variant="outline" className="rounded-xl">
            Browse Services
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/order-confirmation/${order.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 ${statusColors[order.status] || statusColors.pending}`}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  ₹{order.total.toLocaleString()} · {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
