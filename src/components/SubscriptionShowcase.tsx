import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Crown, ChevronRight, Check } from "lucide-react";
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
    <div className={compact ? "mt-5" : "mt-8 px-5"}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-accent" />
          <h2 className={`font-display font-bold text-foreground ${compact ? "text-sm" : "text-lg"}`}>
            Subscription Plans
          </h2>
        </div>
        {compact && (
          <button onClick={() => navigate("/subscriptions")} className="text-[11px] font-semibold text-accent uppercase tracking-wider flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Cycle Toggle */}
      <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
        {cycles.map((c) => (
          <button
            key={c.value}
            onClick={() => setCycle(c.value)}
            className={`relative flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
              cycle === c.value ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {cycle === c.value && (
              <motion.div
                layoutId={compact ? "cycle-bg-compact" : "cycle-bg"}
                className="absolute inset-0 rounded-lg bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cycle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={compact ? "space-y-3" : "flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"}
        >
          {displayed.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No plans for this cycle yet.</p>
          ) : (
            displayed.map((plan) => {
              const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
              const savings = plan.original_price && plan.original_price > plan.price
                ? Math.round(((plan.original_price - plan.price) / plan.original_price) * 100)
                : null;

              return (
                <motion.div
                  key={plan.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/subscriptions")}
                  className={`relative cursor-pointer rounded-2xl border p-4 transition-shadow hover:shadow-md snap-center shrink-0 ${
                    plan.is_popular
                      ? "border-accent/40 bg-accent/5"
                      : "border-border bg-card"
                  } ${compact ? "" : "w-[260px]"}`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-accent px-2.5 py-0.5 text-[9px] font-bold text-accent-foreground uppercase tracking-wider">
                      Popular
                    </span>
                  )}

                  <p className="text-sm font-bold text-foreground">{plan.name}</p>
                  {plan.kg_limit && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Up to {plan.kg_limit} kg</p>
                  )}

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-foreground">₹{plan.price.toLocaleString()}</span>
                    {plan.original_price && (
                      <span className="text-xs text-muted-foreground line-through">₹{plan.original_price.toLocaleString()}</span>
                    )}
                    {savings && (
                      <span className="ml-1 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-600">
                        Save {savings}%
                      </span>
                    )}
                  </div>

                  {!compact && features.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <Check className="h-3 w-3 mt-0.5 text-accent shrink-0" />
                          {String(f)}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    size="sm"
                    className="mt-3 w-full rounded-xl text-xs h-8"
                    variant={plan.is_popular ? "default" : "outline"}
                  >
                    Subscribe
                  </Button>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
