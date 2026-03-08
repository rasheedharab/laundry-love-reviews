import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, Check, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import ReviewDialog from "@/components/ReviewDialog";
import type { Tables } from "@/integrations/supabase/types";

interface OrderItem {
  id: string;
  service_id: string;
  services?: { name: string } | null;
}

// Generate confetti particles once
function useConfetti(count: number) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.5 + Math.random() * 1.5,
      size: 4 + Math.random() * 6,
      color: ["hsl(25 80% 52%)", "hsl(40 70% 55%)", "hsl(25 60% 44%)", "hsl(35 30% 96%)", "hsl(0 72% 51%)"][
        Math.floor(Math.random() * 5)
      ],
      rotation: Math.random() * 360,
    })),
    [count]
  );
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Tables<"orders"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<{ serviceId: string; serviceName: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const confetti = useConfetti(40);

  useEffect(() => {
    if (!id) return;
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setOrder(data);
      setLoading(false);
    });
    supabase.from("order_items").select("id, service_id, services(name)").eq("order_id", id).then(({ data }) => {
      setOrderItems((data as any[]) || []);
    });

    // Auto-hide confetti after 4s
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
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
      <div className="min-h-screen pb-8 relative overflow-hidden">
        {/* Confetti overlay */}
        <AnimatePresence>
          {showConfetti && (
            <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
              {confetti.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
                  animate={{ y: "110vh", opacity: 0, rotate: p.rotation + 720 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
                  style={{
                    position: "absolute",
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size > 7 ? "50%" : "1px",
                    backgroundColor: p.color,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <X className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Confirmation</h1>
          <div className="w-10" />
        </div>

        {/* Success visual with animated checkmark */}
        <div className="flex flex-col items-center px-6 pt-6 pb-2">
          <div className="mb-6 flex h-40 w-56 items-center justify-center rounded-3xl bg-secondary relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground shadow-lg"
            >
              <motion.div
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Check className="h-8 w-8 text-primary-foreground" />
              </motion.div>
            </motion.div>
            {/* Animated ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="absolute h-16 w-16 rounded-2xl border-2 border-accent"
            />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-display font-bold text-foreground mb-2"
          >
            {isCompleted ? "Order Complete" : "Order Confirmed"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-muted-foreground text-center max-w-[280px] leading-relaxed mb-6"
          >
            Relax and let us handle the rest. White Rabbit is on the way to give your garments a premium touch.
          </motion.p>
        </div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mx-5 rounded-2xl border border-border bg-card p-5 mb-6"
        >
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
        </motion.div>

        {/* Review prompt for completed orders */}
        {isCompleted && orderItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mx-5 mb-6"
          >
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
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="px-5 space-y-3"
        >
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => navigate(`/track-order/${order.id}`)}
              className="w-full h-12 rounded-xl bg-foreground text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-foreground/90"
            >
              Track Order
            </Button>
          </motion.div>
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider border-border"
          >
            View Details
          </Button>
        </motion.div>

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
