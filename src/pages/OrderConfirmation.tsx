import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, Check, Clock, MapPin, Star } from "lucide-react";
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
        <Skeleton className="h-20 w-20 rounded-2xl mb-6" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-52 w-full max-w-sm rounded-2xl" />
      </div>
    );
  }

  if (!order) return null;
  const isCompleted = order.status === "completed";

  return (
    <AnimatedPage>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <X className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Confirmation</h1>
          <div className="w-10" />
        </div>

        {/* Success visual */}
        <div className="flex flex-col items-center px-6 pt-6 pb-2">
          <div className="mb-6 flex h-40 w-56 items-center justify-center rounded-3xl bg-secondary">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground shadow-lg">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            {isCompleted ? "Order Complete" : "Order Confirmed"}
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-[280px] leading-relaxed mb-6">
            Relax and let us handle the rest. White Rabbit is on the way to give your garments a premium touch.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="mx-5 rounded-2xl border border-border bg-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-accent font-semibold">Order ID</p>
              <p className="text-lg font-bold text-foreground">#WR-{order.id.slice(0, 6).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
              <Badge className="bg-accent text-accent-foreground border-0 text-[10px] uppercase tracking-wider capitalize mt-0.5">
                {order.status === "confirmed" ? "Scheduled" : order.status.replace("-", " ")}
              </Badge>
            </div>
          </div>

          <div className="h-px bg-border mb-4" />

          {order.pickup_time_slot && (
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold">Pickup Estimation</p>
                <p className="text-sm text-foreground">{order.pickup_time_slot}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <MapPin className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-accent font-semibold">Total</p>
              <p className="text-sm font-bold text-foreground">₹{Number(order.total).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Review prompt for completed orders */}
        {isCompleted && orderItems.length > 0 && (
          <div className="mx-5 mb-6">
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

        {/* Action buttons */}
        <div className="px-5 space-y-3">
          <Button
            onClick={() => navigate(`/track-order/${order.id}`)}
            className="w-full h-12 rounded-xl bg-foreground text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-foreground/90"
          >
            Track Order
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider border-border"
          >
            View Details
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
