import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/EmptyState";
import { addDays, format } from "date-fns";
import { useCartRecommendations } from "@/hooks/useRecommendations";

export default function Cart() {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem, upgradeToExpress, total, itemCount } = useCart();
  const { user } = useAuth();

  const cartServiceIds = useMemo(
    () => Array.from(new Set(items.map((i) => i.serviceId))),
    [items]
  );

  const cartCategoryNames = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoryName).filter(Boolean))),
    [items]
  );

  const { recommendations } = useCartRecommendations({
    userId: user?.id,
    cartServiceIds,
    cartCategoryNames,
  });

  useEffect(() => {
    if (items.length === 0) {
      // Ensure recommendations section hides when cart is cleared
      return;
    }
  }, [items.length]);

  const hasExpressItem = items.some((item) => item.tier === "express");
  const pickupDate = addDays(new Date(), 1);
  const returnDate = addDays(pickupDate, hasExpressItem ? 2 : 5);
  const estReturnLabel = format(returnDate, "EEE, MMM d");

  const subscriptionThreshold = 1500;
  const showSubscriptionTeaser = total >= subscriptionThreshold;

  return (
    <AnimatedPage>
      <div className="pb-24">
        <div className="px-5 pt-6 pb-4">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Your Bag</h1>
          <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
        </div>

        {items.length === 0 ? (
          <div className="px-5">
            <EmptyState variant="cart" title="Your bag is empty" description="Browse our services to get started" />
            <div className="flex justify-center">
              <Button onClick={() => navigate("/services")} variant="outline" className="rounded-xl">
                Browse Services
              </Button>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick picks
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/services/laundry")}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-accent/60 hover:bg-accent/5"
                >
                  Everyday Laundry
                </button>
                <button
                  onClick={() => navigate("/services/dry-cleaning")}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-accent/60 hover:bg-accent/5"
                >
                  Dry Cleaning
                </button>
                <button
                  onClick={() => navigate("/services/party-occasion-wear")}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-accent/60 hover:bg-accent/5"
                >
                  Occasion Wear
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`${item.serviceId}-${item.tier}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.5, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -120) {
                      removeItem(item.serviceId, item.tier);
                    }
                  }}
                  className="rounded-xl glass p-4 cursor-grab active:cursor-grabbing touch-pan-y"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.serviceName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.categoryName} · {item.tier === "express" ? "Express" : "Standard"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.tier === "express"
                          ? item.turnaroundExpress || item.turnaround
                          : item.turnaroundStandard || item.turnaround}
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item.serviceId, item.tier)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-lg border border-border">
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQuantity(item.serviceId, item.tier, item.quantity - 1)} className="p-2">
                        <Minus className="h-3 w-3" />
                      </motion.button>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={item.quantity}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="text-sm font-semibold w-4 text-center"
                        >
                          {item.quantity}
                        </motion.span>
                      </AnimatePresence>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQuantity(item.serviceId, item.tier, item.quantity + 1)} className="p-2">
                        <Plus className="h-3 w-3" />
                      </motion.button>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={item.price * item.quantity}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-sm font-bold text-foreground"
                      >
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  {item.tier === "standard" && item.priceExpress && item.priceExpress > item.price && (
                    <button
                      type="button"
                      onClick={() => upgradeToExpress(item.serviceId, item.tier)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-secondary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Need it sooner? Upgrade to Express for an additional ₹
                      {(item.priceExpress - item.price).toLocaleString()}
                    </button>
                  )}
                  <p className="text-[9px] text-muted-foreground/50 mt-2 text-center">← Swipe to remove</p>
                </motion.div>
              ))}
            </AnimatePresence>

            {recommendations.length > 0 && (
              <div className="mt-4 rounded-2xl border border-border bg-card/70 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    You might also like
                  </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {recommendations.map((svc) => (
                    <div
                      key={svc.id}
                      className="min-w-[180px] rounded-xl border border-border bg-background/80 px-3 py-3 text-left"
                    >
                      <p className="line-clamp-2 text-xs font-semibold text-foreground">
                        {svc.name}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        From ₹{Number(svc.price_standard).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          addItem({
                            serviceId: svc.id,
                            serviceName: svc.name,
                            categoryName: "",
                            price: Number(svc.price_standard),
                            tier: "standard",
                            turnaround: svc.turnaround_standard || "3-5 days",
                            priceExpress: svc.price_express ?? null,
                            turnaroundStandard: svc.turnaround_standard,
                            turnaroundExpress: svc.turnaround_express,
                          })
                        }
                        className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-foreground px-3 text-[11px] font-semibold text-background"
                      >
                        Add to bag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-40 glass px-5 py-3">
            <div className="mx-auto max-w-lg">
              {!user && (
                <button
                  onClick={() => navigate("/login?redirect=/cart")}
                  className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-secondary/80 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogIn className="h-3 w-3" /> Sign in for a faster checkout
                </button>
              )}
              {showSubscriptionTeaser && (
                <button
                  type="button"
                  onClick={() => navigate("/subscriptions")}
                  className="mb-2 flex w-full items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-left"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      Save more with a plan
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Frequent loads? A subscription can lower your monthly spend.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                    View plans
                  </span>
                </button>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-foreground">₹{total.toLocaleString()}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Est. return by {estReturnLabel}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                    Have a promo code? You can apply it on the next step.
                  </p>
                </div>
                <motion.div whileTap={{ scale: 0.97 }}>
                <Button onClick={() => navigate(user ? "/checkout" : "/login?redirect=/checkout")} className="h-11 rounded-xl px-8 text-sm font-semibold">
                    Proceed to Checkout
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
