import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, FileText, Search, Truck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OrderCardSkeleton from "@/components/skeletons/OrderCardSkeleton";
import AnimatedPage from "@/components/AnimatedPage";
import PullToRefresh from "@/components/PullToRefresh";
import EmptyState from "@/components/EmptyState";
import type { Tables } from "@/integrations/supabase/types";

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
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const activeOrders = orders.filter(o => !["completed", "cancelled"].includes(o.status));
  const historyOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status));

  return (
    <AnimatedPage>
      <PullToRefresh onRefresh={fetchOrders}>
        <div className="px-5 pt-6 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">Orders</h1>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState variant="orders" title="No orders yet" description="Book a service to get started" />
          ) : (
            <>
              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                        {/* Order header */}
                        <div className="p-5 pb-4">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
                              {order.status === "in-progress" ? (
                                <Truck className="h-5 w-5 text-primary-foreground" />
                              ) : (
                                <span className="text-lg text-primary-foreground">✦</span>
                              )}
                            </div>
                            <div>
                              <p className="text-base font-bold text-foreground">
                                #WR-{order.id.slice(0, 4).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.status === "in-progress" ? "Driver Nearby" : "Scheduled Pickup"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <div className={`h-2 w-2 rounded-full ${statusDot[order.status] || statusDot.pending}`} />
                            <span className="text-xs font-semibold capitalize text-foreground">
                              {order.status === "in-progress" ? "In Cleaning" : order.status.replace("-", " ")}
                            </span>
                          </div>

                          <div className="h-px bg-border mb-4" />

                          <div className="flex justify-between mb-0">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</p>
                              <p className="text-sm font-semibold text-foreground">
                                {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Amount</p>
                              <p className="text-xl font-display font-bold text-foreground">₹{Number(order.total).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 px-5 pb-5">
                          <Button
                            onClick={() => navigate(`/track-order/${order.id}`)}
                            className="flex-1 h-11 rounded-xl bg-foreground text-primary-foreground text-xs font-semibold uppercase tracking-wider hover:bg-foreground/90"
                          >
                            {order.status === "in-progress" ? "Track Delivery" : "Track Status"}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-xl border-border"
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

              {/* History */}
              {historyOrders.length > 0 && (
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">History</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-2">
                    {historyOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                        className="flex w-full items-center gap-3.5 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-secondary/50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">#WR-{order.id.slice(0, 4).toUpperCase()}</p>
                            <Badge className="text-[8px] px-2 py-0.5 h-auto bg-foreground text-primary-foreground border-0 uppercase tracking-wider rounded-md">
                              Done
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ₹{Number(order.total).toLocaleString()}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PullToRefresh>
    </AnimatedPage>
  );
}
