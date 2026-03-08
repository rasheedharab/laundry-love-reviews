import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bell, Phone, User, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MapPlaceholder from "@/components/MapPlaceholder";
import type { Tables } from "@/integrations/supabase/types";

const steps = [
  { key: "placed", label: "Order Placed", desc: "10:30 AM" },
  { key: "pickup", label: "Pickup Scheduled", desc: "2:00 PM" },
  { key: "cleaning", label: "In Cleaning", desc: "Processing" },
  { key: "quality", label: "Quality Check", desc: "Pending" },
  { key: "delivery", label: "Out for Delivery", desc: "Pending" },
];

const statusToStep: Record<string, number> = {
  pending: 0, confirmed: 1, "in-progress": 2, completed: 4, cancelled: -1,
};

export default function TrackOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Tables<"orders"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setOrder(data);
      setLoading(false);
    });

    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => {
        setOrder(payload.new as Tables<"orders">);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <div className="px-5 pt-6 space-y-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-6 w-48" />
        <div className="space-y-6 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Order not found</div>;

  const activeStep = statusToStep[order.status] ?? 0;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Track Order</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <Bell className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Map */}
      <div className="mx-5 mt-4 relative">
        <MapPlaceholder height="h-52" label="Live tracking" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-foreground">En Route</span>
        </div>
      </div>

      {/* Order Reference */}
      <div className="px-5 mt-5 mb-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Order Reference</p>
            <p className="text-2xl font-display font-bold text-foreground">WR-{order.id.slice(0, 5).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Arrival</p>
            <p className="text-lg font-bold text-foreground">{order.pickup_time_slot?.split("–")[0]?.trim() || "10:00 AM"}</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border mx-5 mb-5" />

      {/* Timeline */}
      <div className="px-5 mb-6">
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            const isPending = i > activeStep;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                    isDone ? "bg-foreground" : isActive ? "bg-accent" : "bg-secondary"
                  }`}>
                    {isDone ? (
                      <Check className="h-4 w-4 text-primary-foreground" />
                    ) : isActive ? (
                      <span className="text-xs text-accent-foreground">✦</span>
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-10 transition-colors ${isDone ? "bg-foreground" : "bg-border"}`} />
                  )}
                </div>
                <div className={`pb-6 pt-1 ${isPending ? "opacity-40" : ""}`}>
                  <p className={`text-sm font-semibold ${isActive ? "text-accent" : "text-foreground"}`}>{step.label}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {isPending ? "Pending" : step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Valet Card */}
      <div className="mx-5 rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary overflow-hidden">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Valet</p>
            <p className="text-sm font-semibold text-foreground">Assigned at Pickup</p>
          </div>
          <Button size="icon" className="h-10 w-10 rounded-full bg-foreground text-primary-foreground hover:bg-foreground/90">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
