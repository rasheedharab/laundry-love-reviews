import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, ChevronDown, ArrowRight, User, Truck, MessageCircle, Crown, Gift, ChevronRight, Sparkles, Copy, BookOpen, Bell, LogIn, Search, Leaf, CloudSun, Shirt, ShieldCheck, Package, Scissors, Briefcase, Wind } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton";
import AnimatedPage from "@/components/AnimatedPage";
import PullToRefresh from "@/components/PullToRefresh";
import ScrollReveal from "@/components/ScrollReveal";
import ServiceSearch from "@/components/ServiceSearch";
import logoImg from "@/assets/logo.png";
import TiltCard from "@/components/TiltCard";
import heroBg from "@/assets/hero-bg.jpg";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
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
  { num: 1, title: "Inspection", Icon: Search },
  { num: 2, title: "Spotting", Icon: Sparkles },
  { num: 3, title: "Eco-Wash", Icon: Leaf },
  { num: 4, title: "Drying", Icon: CloudSun },
  { num: 5, title: "Finishing", Icon: Shirt },
  { num: 6, title: "QC Check", Icon: ShieldCheck },
  { num: 7, title: "Packaging", Icon: Package },
];

const careTips = [
  { title: "Storing Silk", desc: "Keep silk garments in breathable cotton bags away from direct sunlight.", Icon: Scissors },
  { title: "Leather Care 101", desc: "Condition leather every 3 months to maintain its supple texture.", Icon: Briefcase },
  { title: "Wool Refresh", desc: "Steam instead of washing to preserve wool fibers and shape.", Icon: Wind },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Tables<"service_categories">[]>([]);
  const [activeOrder, setActiveOrder] = useState<Tables<"orders"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const recentlyViewed = useRecentlyViewed();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: cats } = await supabase.from("service_categories").select("*").order("sort_order");
    if (cats) setCategories(cats);

    if (user) {
      const [ordersRes, profileRes, notifRes] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user.id).not("status", "in", '("completed","cancelled")').order("created_at", { ascending: false }).limit(1),
        supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      ]);
      setActiveOrder(ordersRes.data?.[0] ?? null);
      setProfile(profileRes.data);
      setUnreadCount(notifRes.count ?? 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AnimatedPage>
      <PullToRefresh onRefresh={fetchData}>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-2">
            <div>
              {user && profile?.full_name ? (
                <p className="text-sm text-muted-foreground">{getGreeting()},</p>
              ) : (
                <p className="text-sm text-muted-foreground">{getGreeting()}</p>
              )}
              <p className="text-lg font-display font-bold text-foreground">
                {user && profile?.full_name ? profile.full_name.split(" ")[0] : "Welcome"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigate("/notifications")}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative flex h-11 w-11 items-center justify-center rounded-full glass-sm"
              >
                <Bell className="h-5 w-5 text-foreground" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button
                onClick={() => navigate("/profile")}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex h-11 w-11 items-center justify-center rounded-full glass-sm"
              >
                <User className="h-5 w-5 text-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Guest Sign-In Banner */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-5 mb-3 flex items-center justify-between rounded-2xl glass-accent px-4 py-3"
            >
              <p className="text-sm font-medium text-accent-foreground">Sign in for orders & rewards</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/signup")}
                  className="text-xs font-semibold text-accent-foreground/80 hover:text-accent-foreground underline underline-offset-2"
                >
                  Sign Up
                </button>
                <Button
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="h-8 rounded-xl bg-accent-foreground text-accent hover:bg-accent-foreground/90 text-xs font-semibold gap-1.5"
                >
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </Button>
              </div>
            </motion.div>
          )}


          <div className="px-5 -mt-1 mb-4 space-y-3">
            <ServiceSearch />
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
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="relative z-10 p-6 pb-7 mx-3 mb-3 rounded-2xl glass-dark">
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
              className="mx-5 mb-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-2xl glass-dark p-4"
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

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <ScrollReveal>
              <div className="px-5 mb-5">
                <h2 className="text-lg font-display font-bold text-foreground mb-3">Recently Viewed</h2>
                <motion.div
                  className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                >
                  {recentlyViewed.map((item) => {
                    const img = heroImages[item.categorySlug] || catDryCleaning;
                    return (
                      <motion.button
                        key={item.serviceId}
                        onClick={() => navigate(`/service/${item.serviceSlug}`)}
                        className="flex-shrink-0 w-[140px] overflow-hidden rounded-2xl text-left group glass-hover"
                        variants={{
                          hidden: { opacity: 0, y: 16, scale: 0.97 },
                          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
                        }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <img
                          src={img}
                          alt={item.serviceName}
                          className="h-24 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{item.serviceName}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </ScrollReveal>
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
                <CardGridSkeleton count={6} columns={2} />
              ) : (
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                >
                  {categories.map((cat) => {
                    const img = heroImages[cat.slug] || catDryCleaning;
                    return (
                      <motion.div
                        key={cat.id}
                        variants={{
                          hidden: { opacity: 0, y: 24, scale: 0.97 },
                          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
                        }}
                      >
                        <TiltCard className="relative overflow-hidden rounded-2xl text-left group cursor-pointer" tiltMax={6} scale={1.03}>
                          <button onClick={() => navigate(`/services/${cat.slug}`)} className="w-full text-left">
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
                        </TiltCard>
                      </motion.div>
                    );
                  })}
                </motion.div>
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
                className="w-full overflow-hidden rounded-2xl glass-accent p-5 text-left relative"
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
              <motion.div
                className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              >
                {ritualSteps.map((step) => (
                  <motion.button
                    key={step.num}
                    onClick={() => navigate("/ritual")}
                    className="flex-shrink-0 w-[100px] flex flex-col items-center gap-2 rounded-2xl glass p-4 glass-hover"
                    variants={{
                      hidden: { opacity: 0, y: 24, scale: 0.97 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                    whileHover={{ y: -3, scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <step.Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-accent font-bold">Step {step.num}</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{step.title}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Membership / Premium Club Teaser */}
          <ScrollReveal delay={0.05}>
            <div className="px-5 mt-8">
              <button
                onClick={() => navigate("/membership")}
                className="w-full overflow-hidden rounded-2xl glass-dark p-5 text-left relative"
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
              <motion.div
                className="space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              >
                {careTips.map((tip) => (
                  <motion.button
                    key={tip.title}
                    onClick={() => navigate("/garment-advisor")}
                    className="w-full flex items-start gap-3.5 rounded-2xl glass p-4 text-left glass-hover"
                    variants={{
                      hidden: { opacity: 0, y: 24, scale: 0.97 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                    whileHover={{ x: 4, boxShadow: "0 8px 24px -6px hsl(18 82% 40% / 0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <tip.Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Blog CTA */}
          <ScrollReveal delay={0.05}>
            <div className="px-5 mt-8">
              <button
                onClick={() => navigate("/blog")}
                className="w-full overflow-hidden rounded-2xl glass p-5 text-left"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-display font-bold text-foreground">From Our Blog</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Garment care guides, style tips, and behind-the-scenes stories from our experts.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider">
                      Read Articles <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollReveal>

          {/* Referral CTA */}
          <ScrollReveal delay={0.05} direction="left">
            <div className="px-5 mt-8">
              <button
                onClick={() => navigate("/referral")}
                className="w-full overflow-hidden rounded-2xl glass p-5 text-left"
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
              <div className="flex items-center justify-between rounded-2xl glass p-5">
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
            <img src={logoImg} alt="White Rabbit" className="h-16 opacity-15" />
          </div>

          {/* Chat FAB */}
          <motion.button
            onClick={() => navigate("/garment-advisor")}
            className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30"
            whileHover={{ scale: 1.12, boxShadow: "0 8px 32px -4px hsl(18 82% 40% / 0.45)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <MessageCircle className="h-6 w-6 text-accent-foreground" />
          </motion.button>
        </div>
      </PullToRefresh>
    </AnimatedPage>
  );
}
