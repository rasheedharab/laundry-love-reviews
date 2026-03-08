import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Package, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedPage from "@/components/AnimatedPage";
import ReviewDialog from "@/components/ReviewDialog";
import type { Tables } from "@/integrations/supabase/types";

interface OrderItem {
  id: string;
  service_id: string;
  services?: { name: string } | null;
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Tables<"orders"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<{ serviceId: string; serviceName: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setOrder(data);
      setLoading(false);
    });
    supabase.from("order_items").select("id, service_id, services(name)").eq("order_id", id).then(({ data }) => {
      setOrderItems((data as any[]) || []);
    });
  }, [id]);

  const openReview = (serviceId: string, serviceName: string) => {
    setReviewItem({ serviceId, serviceName });
    setReviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <Skeleton className="h-20 w-20 rounded-full mb-6" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-40 w-full max-w-sm rounded-xl mb-6" />
        <div className="flex gap-3 w-full max-w-sm">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) return null;
  const isCompleted = order.status === "completed";

  return (
    <AnimatedPage>
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>

        <h1 className="mb-2 text-2xl font-display font-bold text-foreground">
          {isCompleted ? "Order Complete!" : "Order Confirmed!"}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">Your garments are in expert hands</p>

        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Order ID</p>
            <p className="text-xs font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className="text-[10px] bg-primary/10 text-primary border-0 capitalize">{order.status}</Badge>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Pickup</p>
            <p className="text-xs text-foreground">{order.pickup_time_slot}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-bold text-foreground">₹{order.total.toLocaleString()}</p>
          </div>
        </div>

        {/* Review prompt for completed orders */}
        {isCompleted && orderItems.length > 0 && (
          <div className="w-full max-w-sm mb-6">
            <p className="text-xs font-semibold text-foreground mb-2">Rate your experience</p>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openReview(item.service_id, (item.services as any)?.name || "Service")}
                  className="flex w-full items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-left"
                >
                  <Star className="h-4 w-4 text-accent" />
                  <span className="flex-1 text-sm text-foreground">{(item.services as any)?.name || "Service"}</span>
                  <span className="text-xs text-accent font-medium">Review →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full max-w-sm">
          <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => navigate("/orders")}>
            <Package className="h-4 w-4 mr-2" /> Track Order
          </Button>
          <Button className="flex-1 h-11 rounded-xl" onClick={() => navigate("/home")}>
            Home <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {reviewItem && order && (
          <ReviewDialog
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            orderId={order.id}
            serviceId={reviewItem.serviceId}
            serviceName={reviewItem.serviceName}
          />
        )}
      </div>
    </AnimatedPage>
  );
}
