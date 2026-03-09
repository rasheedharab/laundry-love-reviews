import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Sparkles, CalendarDays, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import { format, addMonths, addYears, isAfter } from "date-fns";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type BillingCycle = "monthly" | "quarterly" | "yearly";

interface Plan {
  id: string;
  name: string;
  billing_cycle: string;
  price: number;
  original_price: number | null;
  kg_limit: number | null;
  features: string[];
  is_popular: boolean;
  starts_at: string | null;
}

const cycleLabels: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

function computeEndDate(cycle: BillingCycle): Date {
  const now = new Date();
  if (cycle === "monthly") return addMonths(now, 1);
  if (cycle === "quarterly") return addMonths(now, 3);
  return addYears(now, 1);
}

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("id, name, billing_cycle, price, original_price, kg_limit, features, is_popular, starts_at")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setPlans(
          (data || []).map((p: any) => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : [],
          }))
        );
        setLoading(false);
      });
  }, []);

  const filtered = plans.filter((p) => p.billing_cycle === cycle);

  const activateSubscription = async (plan: Plan) => {
    if (!user) return;
    const startDate = new Date().toISOString();
    const endDate = computeEndDate(plan.billing_cycle as BillingCycle).toISOString();

    // Cancel any existing active subscription first
    await supabase
      .from("user_subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("status", "active");

    const { error } = await supabase.from("user_subscriptions").insert({
      user_id: user.id,
      plan_id: plan.id,
      status: "active",
      starts_at: startDate,
      ends_at: endDate,
    });

    if (error) throw error;
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/login");
      return;
    }
    if (!selectedPlan) return;

    setConfirming(true);
    try {
      // Step 1: Create Razorpay order via edge function
      const { data, error: fnError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: selectedPlan.price,
          currency: "INR",
          receipt: `sub_${selectedPlan.id.slice(0, 8)}`,
          notes: { plan_id: selectedPlan.id, user_id: user.id, type: "subscription" },
        },
      });

      if (fnError) throw fnError;

      // Demo mode — keys not configured, activate directly
      if (data.demo_mode) {
        toast.info("Payment gateway in demo mode. Activating subscription directly.");
        await activateSubscription(selectedPlan);
        toast.success(`You're now on the ${selectedPlan.name} plan!`);
        setSelectedPlan(null);
        navigate("/profile");
        return;
      }

      if (!razorpayLoaded || !window.Razorpay) {
        toast.error("Payment gateway not loaded. Please try again.");
        setConfirming(false);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "White Rabbit",
        description: `${selectedPlan.name} — ${selectedPlan.billing_cycle} plan`,
        order_id: data.order_id,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }
            );

            if (verifyError || !verifyData?.verified) {
              toast.error("Payment verification failed");
              setConfirming(false);
              return;
            }

            // Step 4: Activate subscription after verified payment
            await activateSubscription(selectedPlan);
            toast.success(`Payment successful! You're now on the ${selectedPlan.name} plan.`);
            setSelectedPlan(null);
            navigate("/profile");
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to activate subscription after payment");
          } finally {
            setConfirming(false);
          }
        },
        theme: { color: "#c46a32" },
        modal: {
          ondismiss: () => {
            setConfirming(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res: any) => {
        console.error("Payment failed:", res.error);
        toast.error(res.error.description || "Payment failed");
        setConfirming(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to initiate payment");
      setConfirming(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="pb-24">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground uppercase tracking-[0.15em]">
            Subscription Plans
          </h1>
          <div className="w-10" />
        </div>

        {/* Hero */}
        <div className="mx-5 mb-6 rounded-2xl bg-gradient-to-br from-accent via-accent/80 to-accent/60 p-5 text-accent-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              Save more every month
            </span>
          </div>
          <p className="text-lg font-display font-bold leading-tight">
            Unlimited pickups. Premium care. One flat price.
          </p>
        </div>

        {/* Cycle Tabs */}
        <div className="mx-5 mb-5 flex rounded-xl bg-secondary p-1 gap-1">
          {(["monthly", "quarterly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                cycle === c
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cycleLabels[c]}
            </button>
          ))}
        </div>

        {/* Plan Cards */}
        <div className="px-5 space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-border p-5 space-y-3">
                <Skeleton className="h-5 w-1/3 rounded-lg" />
                <Skeleton className="h-8 w-1/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No plans available for {cycleLabels[cycle].toLowerCase()} billing yet.
              </p>
            </div>
          ) : (
            filtered.map((plan) => {
              const savings =
                plan.original_price && plan.original_price > plan.price
                  ? plan.original_price - plan.price
                  : null;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-5 relative transition-all ${
                    plan.is_popular
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.is_popular && (
                    <Badge className="absolute -top-2.5 right-4 bg-accent text-accent-foreground border-0 text-[9px] uppercase tracking-wider font-bold px-2.5">
                      Most Popular
                    </Badge>
                  )}
                  <p className="text-base font-display font-bold text-foreground mb-1">
                    {plan.name}
                  </p>
                  {plan.kg_limit && (
                    <p className="text-[11px] text-muted-foreground mb-3">
                      Up to {plan.kg_limit} kg / {cycle === "yearly" ? "year" : cycle === "quarterly" ? "quarter" : "month"}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(plan.price)}
                    </span>
                    {plan.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(plan.original_price)}
                      </span>
                    )}
                    {savings && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent border-0"
                      >
                        Save {formatPrice(savings)}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 mb-5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center ${
                            plan.is_popular ? "bg-accent/20" : "bg-secondary"
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${
                              plan.is_popular ? "text-accent" : "text-primary"
                            }`}
                          />
                        </div>
                        <span className="text-sm text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  {plan.starts_at && isAfter(new Date(plan.starts_at), new Date()) && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Starts {format(new Date(plan.starts_at), "dd MMM yyyy")}</span>
                    </div>
                  )}
                  <Button
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider ${
                      plan.is_popular
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-foreground text-primary-foreground hover:bg-foreground/90"
                    }`}
                  >
                    Subscribe Now
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Confirmation Modal */}
        <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Confirm Subscription</DialogTitle>
              <DialogDescription>
                Review your plan details and proceed to payment.
              </DialogDescription>
            </DialogHeader>

            {selectedPlan && (
              <div className="space-y-4 py-2">
                {/* Plan summary */}
                <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center">
                      <Package className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedPlan.name}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {selectedPlan.billing_cycle} plan
                      </p>
                    </div>
                    <span className="ml-auto text-lg font-bold text-foreground">
                      {formatPrice(selectedPlan.price)}
                    </span>
                  </div>

                  {selectedPlan.kg_limit && (
                    <p className="text-xs text-muted-foreground">
                      Includes up to <strong className="text-foreground">{selectedPlan.kg_limit} kg</strong> of laundry
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Starts</span>
                    <span className="ml-auto font-medium text-foreground">
                      {format(new Date(), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Renews / Ends</span>
                    <span className="ml-auto font-medium text-foreground">
                      {format(
                        computeEndDate(selectedPlan.billing_cycle as BillingCycle),
                        "dd MMM yyyy"
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment info */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-accent shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    You'll be redirected to Razorpay to complete payment securely.
                  </p>
                </div>

                {/* Features recap */}
                {selectedPlan.features.length > 0 && (
                  <div className="space-y-1.5">
                    {selectedPlan.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-accent" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                onClick={handleSubscribe}
                disabled={confirming}
                className="w-full h-11 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold uppercase tracking-wider gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {confirming ? "Processing…" : "Pay & Subscribe"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedPlan(null)}
                disabled={confirming}
                className="w-full text-xs text-muted-foreground"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
