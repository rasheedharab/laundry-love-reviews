import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Crown, ChevronRight, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Plan = Tables<"subscription_plans">;
type Cycle = "monthly" | "quarterly" | "yearly";

const cycles: { value: Cycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

interface Props {
  compact?: boolean;
}

export default function SubscriptionShowcase({ compact = false }: Props) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [cycle, setCycle] = useState<Cycle>("monthly");
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

  const filtered = plans.filter((p) => p.billing_cycle === cycle);
  const displayed = compact ? filtered.slice(0, 2) : filtered;

  if (loading || plans.length === 0) return null;

  return (
    <div className={compact ? "mt-6" : "mt-8 px-5"}>
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
              <Crown className="h-3.5 w-3.5 text-accent" />
            </div>
            <h2 className={`font-display font-bold text-foreground ${compact ? "text-sm" : "text-lg"}`}>
              Subscription Plans
            </h2>
          </div>
          {!compact && (
            <p className="text-[11px] text-muted-foreground ml-9">Save more with a plan that fits your lifestyle</p>
          )}
        </div>
        {compact && (
          <button onClick={() => navigate("/subscriptions")} className="text-[11px] font-semibold text-accent uppercase tracking-wider flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Cycle Toggle */}
      <div className="mb-4 inline-flex gap-0.5 rounded-full bg-secondary p-0.5">
        {cycles.map((c) => (
          <button
            key={c.value}
            onClick={() => setCycle(c.value)}
            className="relative rounded-full px-4 py-1.5 text-[11px] font-semibold transition-colors"
          >
            {cycle === c.value && (
              <motion.div
                layoutId={compact ? "sub-pill-compact" : "sub-pill"}
                className="absolute inset-0 rounded-full bg-accent shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${cycle === c.value ? "text-accent-foreground" : "text-muted-foreground"}`}>
              {c.label}
            </span>
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cycle}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={compact ? "space-y-3" : "flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-1 px-1"}
        >
          {displayed.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center w-full">No plans for this cycle yet.</p>
          ) : (
            displayed.map((plan) => {
              const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
              const savings = plan.original_price && plan.original_price > plan.price
                ? Math.round(((plan.original_price - plan.price) / plan.original_price) * 100)
                : null;

              return (
                <motion.div
                  key={plan.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/subscriptions")}
                  className={`relative cursor-pointer snap-center shrink-0 overflow-hidden rounded-2xl transition-shadow hover:shadow-lg ${
                    compact ? "w-full" : "w-[270px]"
                  } ${
                    plan.is_popular
                      ? "bg-gradient-to-br from-accent/10 via-card to-accent/5 border-2 border-accent/30 shadow-md shadow-accent/10"
                      : "glass border border-border"
                  }`}
                >
                  {/* Popular ribbon */}
                  {plan.is_popular && (
                    <div className="flex items-center gap-1 bg-accent px-3 py-1">
                      <Zap className="h-2.5 w-2.5 text-accent-foreground" />
                      <span className="text-[9px] font-bold text-accent-foreground uppercase tracking-widest">Most Popular</span>
                    </div>
                  )}

                  <div className={`p-4 ${plan.is_popular ? "pt-3" : ""}`}>
                    {/* Plan name + kg */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-display font-bold text-foreground">{plan.name}</p>
                        {plan.kg_limit && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Up to {plan.kg_limit} kg / cycle</p>
                        )}
                      </div>
                      {savings && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent whitespace-nowrap">
                          {savings}% off
                        </span>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-display text-foreground">₹{plan.price.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">/{cycle === "monthly" ? "mo" : cycle === "quarterly" ? "qtr" : "yr"}</span>
                      {plan.original_price && plan.original_price > plan.price && (
                        <span className="text-xs text-muted-foreground/60 line-through">₹{plan.original_price.toLocaleString()}</span>
                      )}
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <ul className={`mt-3 space-y-1.5 ${compact ? "" : "border-t border-border/50 pt-3"}`}>
                        {features.slice(0, compact ? 2 : 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/70">
                            <Check className="h-3 w-3 mt-0.5 text-accent shrink-0" />
                            <span>{String(f)}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <Button
                      size="sm"
                      className={`mt-4 w-full rounded-xl text-xs font-semibold h-9 ${
                        plan.is_popular
                          ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                          : ""
                      }`}
                      variant={plan.is_popular ? "default" : "outline"}
                    >
                      {plan.is_popular ? "Get Started" : "Choose Plan"}
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* View all link for full mode */}
      {!compact && (
        <button
          onClick={() => navigate("/subscriptions")}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent"
        >
          View all plans <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
