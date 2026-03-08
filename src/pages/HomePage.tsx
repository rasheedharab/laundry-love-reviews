import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, ChevronDown, ArrowRight, User, Truck, MessageCircle, Crown, Gift, ChevronRight, Sparkles, Copy } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedPage from "@/components/AnimatedPage";
import PullToRefresh from "@/components/PullToRefresh";
import ScrollReveal from "@/components/ScrollReveal";
import logoImg from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import type { Tables } from "@/integrations/supabase/types";

import catPartyWear from "@/assets/cat-party-wear.jpg";
import catDryCleaning from "@/assets/cat-dry-cleaning.jpg";
import catLeatherCare from "@/assets/cat-leather-care.jpg";
import catCarpets from "@/assets/cat-carpets.jpg";
import catSofaCare from "@/assets/cat-sofa-care.jpg";
import catLaundry from "@/assets/cat-laundry.jpg";

const heroImages: Record<string, string> = {
  "party-occasion-wear": catPartyWear,
  "dry-cleaning": catDryCleaning,
  "leather-care": catLeatherCare,
  "carpets-rugs": catCarpets,
  "sofa-care": catSofaCare,
  "laundry": catLaundry,
};

const ritualSteps = [
  { num: 1, title: "Inspection", icon: "🔍" },
  { num: 2, title: "Spotting", icon: "✨" },
  { num: 3, title: "Eco-Wash", icon: "🌿" },
  { num: 4, title: "Drying", icon: "☁️" },
  { num: 5, title: "Finishing", icon: "👔" },
  { num: 6, title: "QC Check", icon: "✓" },
  { num: 7, title: "Packaging", icon: "🎁" },
];

const careTips = [
  { title: "Storing Silk", desc: "Keep silk garments in breathable cotton bags away from direct sunlight.", icon: "🧵" },
  { title: "Leather Care 101", desc: "Condition leather every 3 months to maintain its supple texture.", icon: "👜" },
  { title: "Wool Refresh", desc: "Steam instead of washing to preserve wool fibers and shape.", icon: "🧶" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Tables<"service_categories">[]>([]);
  const [activeOrder, setActiveOrder] = useState<Tables<"orders"> | null>(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: cats } = await supabase.from("service_categories").select("*").order("sort_order");
    if (cats) setCategories(cats);

    if (user) {
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .not("status", "in", '("completed","cancelled")')
        .order("created_at", { ascending: false })
        .limit(1);
      setActiveOrder(orders?.[0] ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AnimatedPage>
      <PullToRefresh onRefresh={fetchData}>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <button
              onClick={() => navigate("/select-outlet")}
              className="flex items-center gap-2 rounded-full glass-sm px-4 py-2.5"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Your Location</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex h-11 w-11 items-center justify-center rounded-full glass-sm"
            >
              <User className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Location selector */}
          <div className="px-5 -mt-2 mb-4">
            <button onClick={() => navigate("/select-outlet")} className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Select Outlet/City</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Hero Section */}
          <div ref={heroRef} className="relative mx-5 mb-5 overflow-hidden rounded-2xl min-h-[340px] flex flex-col justify-end">
            <motion.img
              src={heroBg}
              alt=""
              className="absolute inset-0 h-[130%] w-full object-cover"
              style={{ y: heroY, scale: heroScale }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="relative z-10 p-6 pb-7">
              <h1 className="mb-2 text-3xl font-display font-bold leading-tight text-foreground">
                Expert care for<br />
                <span className="text-foreground">your wardrobe.</span>
              </h1>
              <p className="mb-5 text-sm text-muted-foreground leading-relaxed">
                High-end dry cleaning & laundry services<br />
                crafted for modern luxury.
              </p>
              <Button
                onClick={() => navigate("/services")}
                className="h-11 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-6 hover:bg-accent/90"
              >
                Book Now
              </Button>
            </div>
          </div>

          {/* Active Order Card */}
          {activeOrder && (
            <button
              onClick={() => navigate(`/track-order/${activeOrder.id}`)}
              className="mx-5 mb-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-2xl bg-foreground p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <Truck className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-primary-foreground">
                  Active Order #{activeOrder.id.slice(0, 4).toUpperCase()}
                </p>
                <p className="text-xs text-primary-foreground/60">
                  {activeOrder.pickup_time_slot
                    ? `Pickup scheduled for ${activeOrder.pickup_time_slot}`
                    : `Status: ${activeOrder.status.replace("-", " ")}`}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card">
                <ArrowRight className="h-4 w-4 text-foreground" />
              </div>
            </button>
          )}

          {/* Our Services — Image Cards */}
          <ScrollReveal>
            <div className="px-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-foreground">Our Services</h2>
                <button onClick={() => navigate("/services")} className="text-xs font-semibold text-accent uppercase tracking-wider">
                  View All
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const img = heroImages[cat.slug] || catDryCleaning;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => navigate(`/services/${cat.slug}`)}
                        className="relative overflow-hidden rounded-2xl text-left transition-shadow hover:shadow-lg group"
                      >
                        <img
                          src={img}
                          alt={cat.name}
                          className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3.5">
                          <p className="text-sm font-semibold text-primary-foreground leading-tight">{cat.name}</p>
                          <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider mt-0.5">
                            {cat.description || "Premium Care"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Promotional Banner */}
          <ScrollReveal delay={0.05}>
            <div className="px-5 mt-6">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("WELCOME20");
                  toast.success("Code WELCOME20 copied! Apply it at checkout.", { duration: 3000 });
                  navigate("/services");
                }}
                className="w-full overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent/80 p-5 text-left relative"
              >
                <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent-foreground/20">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                </div>
                <p className="text-[10px] text-accent-foreground/70 uppercase tracking-widest font-medium mb-1">Limited Offer</p>
                <p className="text-xl font-display font-bold text-accent-foreground leading-tight">First Order<br />20% Off</p>
                <p className="text-xs text-accent-foreground/70 mt-2 flex items-center gap-1.5">
                  Use code <span className="font-bold text-accent-foreground bg-accent-foreground/15 px-2 py-0.5 rounded-md">WELCOME20</span> at checkout
                  <Copy className="h-3 w-3 text-accent-foreground/60" />
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                  Shop Now <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            </div>
          </ScrollReveal>

          {/* 7-Step Ritual Preview */}
          <ScrollReveal delay={0.1}>
            <div className="mt-8 px-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-foreground">Our 7-Step Ritual</h2>
                <button onClick={() => navigate("/ritual")} className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Learn More
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                {ritualSteps.map((step) => (
                  <button
                    key={step.num}
                    onClick={() => navigate("/ritual")}
                    className="flex-shrink-0 w-[100px] flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-base">
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-accent font-bold">Step {step.num}</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{step.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Membership / Premium Club Teaser */}
          <ScrollReveal delay={0.05}>
            <div className="px-5 mt-8">
              <button
                onClick={() => navigate("/membership")}
                className="w-full overflow-hidden rounded-2xl bg-foreground p-5 text-left relative"
              >
                <div className="absolute top-4 right-4">
                  <Crown className="h-8 w-8 text-accent/40" />
                </div>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-widest font-medium mb-1">Exclusive Access</p>
                <p className="text-xl font-display font-bold text-primary-foreground leading-tight">Premium Club</p>
                <p className="text-xs text-primary-foreground/60 mt-2 leading-relaxed max-w-[240px]">
                  Unlock priority pickup, exclusive discounts, and complimentary garment care with our membership tiers.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {["Silver", "Gold", "Platinum"].map((tier) => (
                    <span key={tier} className="text-[10px] font-semibold text-accent/80 uppercase tracking-wider bg-accent/10 px-2.5 py-1 rounded-full">
                      {tier}
                    </span>
                  ))}
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider">
                  Explore Membership <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            </div>
          </ScrollReveal>

          {/* Garment Care Tips */}
          <ScrollReveal delay={0.1}>
            <div className="mt-8 px-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-foreground">Care Tips</h2>
                <button onClick={() => navigate("/garment-advisor")} className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Ask Advisor
                </button>
              </div>
              <div className="space-y-3">
                {careTips.map((tip) => (
                  <button
                    key={tip.title}
                    onClick={() => navigate("/garment-advisor")}
                    className="w-full flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-base">
                      {tip.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Referral CTA */}
          <ScrollReveal delay={0.05} direction="left">
            <div className="px-5 mt-8">
              <button
                onClick={() => navigate("/referral")}
                className="w-full overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 p-5 text-left"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                    <Gift className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-display font-bold text-foreground">Invite Friends, Earn Rewards</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Share your referral code and earn 500 loyalty points for every friend who places their first order.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider">
                      Share Now <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollReveal>

          {/* Trust / Social Proof Strip */}
          <ScrollReveal delay={0.1}>
            <div className="px-5 mt-8">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
                {[
                  { value: "10,000+", label: "Garments Cared" },
                  { value: "4.9★", label: "Avg Rating" },
                  { value: "500+", label: "Happy Clients" },
                ].map((stat, i) => (
                  <div key={stat.label} className={`text-center flex-1 ${i > 0 ? "border-l border-border" : ""}`}>
                    <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Brand Footer */}
          <div className="mt-10 mb-6 flex justify-center">
            <img src={logoImg} alt="White Rabbit" className="h-12 opacity-15" />
          </div>

          {/* Chat FAB */}
          <button
            onClick={() => navigate("/garment-advisor")}
            className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 transition-transform hover:scale-105"
          >
            <MessageCircle className="h-6 w-6 text-accent-foreground" />
          </button>
        </div>
      </PullToRefresh>
    </AnimatedPage>
  );
}
