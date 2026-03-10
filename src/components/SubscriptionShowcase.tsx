import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Crown, ChevronRight, Check, Zap, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Plan = Tables<"subscription_plans">;

interface Props {
  compact?: boolean;
}

export default function SubscriptionShowcase({ compact = false }: Props) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setPlans(data);
        setLoading(false);
      });
  }, []);

  // Show monthly plans first, or just all plans
  const monthly = plans.filter((p) => p.billing_cycle === "monthly");
  const displayed = compact ? monthly.slice(0, 1) : monthly.slice(0, 2);
  const hasMore = plans.length > displayed.length;

  if (loading || plans.length === 0) return null;

  return (
    <div className={compact ? "mt-6" : "mt-8 px-5"}>
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-foreground text-lg">
            Laundry Subscriptions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Save big with our periodic plans
          </p>
        </div>
        <button
          onClick={() => navigate("/subscriptions")}
          className="text-xs font-semibold text-accent flex items-center gap-0.5"
        >
          View Plans <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Plan Cards - Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
        {displayed.map((plan) => {
          const features = Array.isArray(plan.features)
            ? (plan.features as string[])
            : [];

          return (
            <motion.div
              key={plan.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/subscriptions")}
              className="relative cursor-pointer snap-center shrink-0 overflow-hidden rounded-2xl bg-card border border-border shadow-sm"
              style={{ width: compact ? "100%" : "min(72vw, 260px)" }}
            >
              <div className="p-5">
                {/* Icon Badge */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 mb-4">
                  {plan.is_popular ? (
                    <Zap className="h-5 w-5 text-accent" />
                  ) : (
                    <Star className="h-5 w-5 text-accent" />
                  )}
                </div>

                {/* Plan Name */}
                <p className="text-base font-display font-bold text-foreground">
                  {plan.name}
                </p>

                {/* Price */}
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-display text-foreground">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    / {plan.billing_cycle === "monthly" ? "month" : plan.billing_cycle === "quarterly" ? "quarter" : "year"}
                  </span>
                </div>

                {/* Original Price */}
                {plan.original_price && plan.original_price > plan.price && (
                  <span className="text-xs text-muted-foreground/60 line-through">
                    ₹{plan.original_price.toLocaleString()}
                  </span>
                )}

                {/* Features */}
                {features.length > 0 && (
                  <ul className="mt-4 space-y-2.5">
                    {features.slice(0, compact ? 2 : 3).map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] text-muted-foreground"
                      >
                        <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                        <span>{String(f)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                <Button
                  size="lg"
                  className="mt-5 w-full rounded-xl text-xs font-bold uppercase tracking-wider h-12 bg-foreground text-background hover:bg-foreground/90"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          );
        })}

        {/* "More Options" card */}
        {hasMore && (
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/subscriptions")}
            className="relative cursor-pointer snap-center shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center"
            style={{ width: compact ? "100%" : "min(72vw, 260px)", minHeight: "280px" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 mb-3">
              <Star className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm font-display font-bold text-foreground">
              More Options
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 px-6">
              Quarterly & Yearly plans available
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
