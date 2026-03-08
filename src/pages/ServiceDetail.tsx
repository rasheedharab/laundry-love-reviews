import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import ServiceReviews from "@/components/ServiceReviews";
import type { Tables } from "@/integrations/supabase/types";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [service, setService] = useState<Tables<"services"> | null>(null);
  const [category, setCategory] = useState<Tables<"service_categories"> | null>(null);
  const [tier, setTier] = useState<"standard" | "express">("standard");

  useEffect(() => {
    if (!slug) return;
    supabase.from("services").select("*").eq("slug", slug).single().then(({ data }) => {
      if (data) {
        setService(data);
        supabase.from("service_categories").select("*").eq("id", data.category_id).single().then(({ data: cat }) => {
          if (cat) setCategory(cat);
        });
      }
    });
  }, [slug]);

  if (!service) {
    return (
      <div className="pb-24">
        <div className="bg-foreground px-5 pt-5 pb-10">
          <Skeleton className="h-4 w-16 bg-primary-foreground/10 mb-6" />
          <Skeleton className="h-6 w-48 bg-primary-foreground/10 mb-2" />
          <Skeleton className="h-4 w-32 bg-primary-foreground/10" />
        </div>
        <div className="px-5 -mt-4 space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  const price = tier === "express" && service.price_express ? service.price_express : service.price_standard;
  const turnaround = tier === "express" ? service.turnaround_express : service.turnaround_standard;

  const handleAdd = () => {
    addItem({
      serviceId: service.id,
      serviceName: service.name,
      categoryName: category?.name || "",
      tier,
      price,
      turnaround: turnaround || "",
    });
    toast.success(`${service.name} added to bag`);
  };

  return (
    <AnimatedPage>
      <div className="pb-24">
        {/* Hero */}
        <div className="relative bg-foreground px-5 pt-5 pb-10">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-primary-foreground/80 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2 mb-2">
            {service.badge && (
              <Badge className="text-[10px] bg-accent text-accent-foreground border-0">{service.badge}</Badge>
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-primary-foreground">{service.name}</h1>
          <p className="mt-1 text-xs text-primary-foreground/60">{category?.name}</p>
        </div>

        <div className="px-5 -mt-4">
          {/* Description Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm mb-4">
            <p className="text-sm text-foreground leading-relaxed">{service.description}</p>
          </div>

          {/* Tier Selection */}
          <div className="mb-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Select Service Tier</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTier("standard")}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  tier === "standard" ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">Standard</span>
                </div>
                <p className="text-lg font-bold text-foreground">₹{service.price_standard.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{service.turnaround_standard}</p>
              </button>

              {service.price_express && (
                <button
                  onClick={() => setTier("express")}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    tier === "express" ? "border-accent bg-accent/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold text-foreground">Express</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">₹{service.price_express.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{service.turnaround_express}</p>
                </button>
              )}
            </div>
          </div>

          {/* What's Included */}
          {service.whats_included && service.whats_included.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">What's Included</h3>
              <div className="space-y-2">
                {service.whats_included.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ServiceReviews serviceId={service.id} />

          {/* 7-Step Ritual Link */}
          <button
            onClick={() => navigate("/ritual")}
            className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4 text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <span className="text-sm">✦</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-accent">Our 7-Step Ritual</p>
              <p className="text-[10px] text-muted-foreground">See how we care for your garments</p>
            </div>
            <Check className="h-4 w-4 text-accent" />
          </button>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md px-5 py-3">
          <div className="mx-auto max-w-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">₹{price.toLocaleString()}</p>
            </div>
            <Button onClick={handleAdd} className="h-11 rounded-xl px-8 text-sm font-semibold">
              Add to Bag
            </Button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
