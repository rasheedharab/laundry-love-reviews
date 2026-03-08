import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bell, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

const steps = [
  { key: "placed", label: "Order Placed", desc: "Your order has been received" },
  { key: "pickup", label: "Pickup Scheduled", desc: "Valet en route for collection" },
  { key: "cleaning", label: "In Cleaning", desc: "Expert treatment in progress" },
  { key: "quality", label: "Quality Check", desc: "Final inspection & finishing" },
  { key: "delivery", label: "Out for Delivery", desc: "Your garments are on the way" },
];

const statusToStep: Record<string, number> = {
  pending: 0, confirmed: 1, "in-progress": 2, completed: 4, cancelled: -1,
};

export default function TrackOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Tables<"orders"> | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setOrder(data);
    });
  }, [id]);

  if (!order) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  const activeStep = statusToStep[order.status] ?? 0;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">Track Order</h1>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Bell className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Map Placeholder */}
      <div className="mx-5 mb-5 relative h-44 rounded-2xl bg-secondary overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-foreground/10 flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <p className="text-xs text-muted-foreground">Live tracking</p>
          </div>
        </div>
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground border-0 text-[9px] uppercase tracking-wider">
          {order.status === "in-progress" ? "In Process" : order.status.replace("-", " ")}
        </Badge>
      </div>

      {/* Order Info */}
      <div className="px-5 mb-5">
        <p className="text-sm font-display font-bold text-foreground">#WR-{order.id.slice(0, 6).toUpperCase()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {order.pickup_time_slot && `Pickup: ${order.pickup_time_slot}`}
        </p>
      </div>

      {/* Timeline */}
      <div className="px-5 mb-6">
        <p className="section-label mb-4">ORDER PROGRESS</p>
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isDone = i <= activeStep;
            const isActive = i === activeStep;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    isDone ? "border-accent bg-accent" : "border-muted-foreground/30 bg-card"
                  }`}>
                    {isDone && <div className="h-1.5 w-1.5 rounded-full bg-accent-foreground" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-12 ${isDone && i < activeStep ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
                <div className={`pb-8 ${isActive ? "" : "opacity-50"}`}>
                  <p className={`text-sm font-semibold ${isActive ? "text-accent" : "text-foreground"}`}>{step.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Valet Card */}
      <div className="mx-5 rounded-2xl border border-border bg-card p-4">
        <p className="section-label mb-3">YOUR VALET</p>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Assigned Valet</p>
            <p className="text-[11px] text-muted-foreground">Will be assigned at pickup</p>
          </div>
          <Button size="icon" variant="outline" className="h-9 w-9 rounded-full">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
