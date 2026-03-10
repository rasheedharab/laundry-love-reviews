import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Award, BadgeCheck, Calendar, CalendarRange, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import RippleTouch from "@/components/RippleTouch";
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

  if (loading || plans.length === 0) return null;

  const cardWidth = "min(78vw, 280px)";

  const getPlanIcon = (plan: Plan) => {
    if (plan.is_popular) return BadgeCheck;
    if (plan.billing_cycle === "yearly") return Award;
    if (plan.billing_cycle === "quarterly") return CalendarRange;
    return Calendar;
  };

  const cycleLabel = (cycle: string) =>
    cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "3 Months" : "Yearly";

  return (
    <div className={compact ? "mt-6" : "mt-8 px-5"}>
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-foreground text-xl tracking-tight">
            Laundry Subscriptions
          </h2>
          <p className="section-label mt-1">
            Save big with our periodic plans
          </p>
        </div>
        <RippleTouch
          as="button"
          onClick={() => navigate("/subscriptions")}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3.5 py-2.5 text-left transition-colors hover:bg-accent/10 hover:border-accent/30"
        >
          <span className="text-xs font-semibold text-accent">View Plans</span>
          <ChevronRight className="h-3.5 w-3.5 text-accent" />
        </RippleTouch>
      </div>

      {/* Plan Cards - Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
        {plans.map((plan, index) => {
          const features = Array.isArray(plan.features)
            ? (plan.features as string[])
            : [];

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
              }}
              className="snap-center shrink-0"
              style={{ width: cardWidth }}
            >
              <RippleTouch
                as="button"
                onClick={() => navigate("/subscriptions")}
                className={`relative flex h-[340px] w-full flex-col overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  plan.is_popular ? "subscription-card-popular" : "subscription-card"
                }`}
              >
                {/* Popular ribbon */}
                {plan.is_popular && (
                  <div className="absolute right-0 top-0 z-10">
                    <div className="flex items-center gap-1 rounded-bl-lg bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                      <BadgeCheck className="h-3 w-3" /> Popular
                    </div>
                  </div>
                )}

                {/* Subtle corner gradient accent */}
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full opacity-30"
                  style={{
                    background: plan.is_popular
                      ? "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)"
                      : "radial-gradient(circle, hsl(var(--foreground) / 0.08) 0%, transparent 70%)",
                  }}
                />

                <div className="relative flex flex-1 flex-col overflow-hidden p-5">
                  {/* Billing cycle pill + Icon */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full border border-border/80 bg-secondary/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {cycleLabel(plan.billing_cycle)}
                    </span>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                        plan.is_popular
                          ? "bg-gradient-to-br from-accent/30 to-accent/10"
                          : "bg-gradient-to-br from-accent/15 to-accent/5"
                      }`}
                    >
                      {(() => {
                        const Icon = getPlanIcon(plan);
                        return <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} />;
                      })()}
                    </div>
                  </div>

                  {/* Plan Name */}
                  <p className="line-clamp-1 text-base font-display font-bold text-foreground">
                    {plan.name}
                  </p>

                  {/* Price */}
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-display text-foreground">
                      ₹{plan.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      / {plan.billing_cycle === "monthly" ? "month" : plan.billing_cycle === "quarterly" ? "quarter" : "year"}
                    </span>
                  </div>

                  {/* Original Price - fixed height */}
                  <div className="mt-0.5 min-h-[18px]">
                    {plan.original_price && plan.original_price > plan.price && (
                      <span className="text-xs text-muted-foreground/70 line-through">
                        ₹{plan.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Features - fixed height for consistent card layout */}
                  <ul className="mt-4 min-h-[72px] flex-1 space-y-2.5">
                    {features.slice(0, 3).map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] text-muted-foreground"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                          <Check className="h-2.5 w-2.5 text-accent" strokeWidth={2.5} />
                        </span>
                        <span className="line-clamp-2">{String(f)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-5 border-t border-border/60 pt-4">
                  <Button
                    type="button"
                    size="lg"
                    className={`w-full shrink-0 rounded-xl text-xs font-bold uppercase tracking-wider h-12 ${
                      plan.is_popular
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    Get Started
                  </Button>
                  </div>
                </div>
              </RippleTouch>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
