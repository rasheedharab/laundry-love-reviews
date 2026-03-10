import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Wind, Briefcase, Layers, Armchair, Shirt, ChevronRight, Bell, MapPin, ChevronDown } from "lucide-react";
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton";
import AnimatedPage from "@/components/AnimatedPage";
import PullToRefresh from "@/components/PullToRefresh";
import ServiceSearch from "@/components/ServiceSearch";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import RippleTouch from "@/components/RippleTouch";
import SubscriptionShowcase from "@/components/SubscriptionShowcase";
import { useOutlet } from "@/contexts/OutletContext";
import type { Tables } from "@/integrations/supabase/types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles, wind: Wind, briefcase: Briefcase, layers: Layers, armchair: Armchair, shirt: Shirt,
};

export default function ServicesHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedOutlet } = useOutlet();
  const [categories, setCategories] = useState<Tables<"service_categories">[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catsRes, profileRes, notifRes] = await Promise.all([
      supabase.from("service_categories").select("*").order("sort_order"),
      user ? supabase.from("profiles").select("full_name").eq("user_id", user.id).single() : Promise.resolve({ data: null }),
      user ? supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false) : Promise.resolve({ count: 0 }),
    ]);
    if (catsRes.data) setCategories(catsRes.data);
    if (profileRes.data) setProfile(profileRes.data);
    setUnreadCount(notifRes.count ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AnimatedPage>
      <PullToRefresh onRefresh={fetchData}>
      <div className="px-5 pt-6 pb-4">
        {/* Header - same as home page */}
        <div className="flex items-center justify-between pb-2 mb-4">
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
          </div>
        </div>

        <h1 className="mb-1 text-2xl font-display font-bold text-foreground">Services</h1>
        <p className="mb-4 text-sm text-muted-foreground">Premium care for everything you own</p>
        <div className="mb-4">
          <ServiceSearch />
        </div>
        <button onClick={() => navigate("/select-outlet")} className="flex items-center gap-1.5 mb-5">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-foreground">
            {selectedOutlet ? selectedOutlet.name + (selectedOutlet.city ? `, ${selectedOutlet.city}` : "") : "Select Outlet/City"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {loading ? (
          <CardGridSkeleton count={4} columns={2} height="h-48" />
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
          >
            {categories.map((cat) => {
              const img = cat.image_url || heroImages[cat.slug] || catDryCleaning;
              return (
                <motion.div
                  key={cat.id}
                  variants={{
                    hidden: { opacity: 0, y: 24, scale: 0.97 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
                  }}
                >
                  <TiltCard className="relative overflow-hidden rounded-2xl text-left group cursor-pointer" tiltMax={6} scale={1.03}>
                    <RippleTouch as="button" onClick={() => navigate(`/services/${cat.slug}`)} className="w-full text-left rounded-2xl">
                      <img src={img} alt={cat.name} className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3.5">
                        <p className="text-sm font-semibold text-primary-foreground leading-tight">{cat.name}</p>
                        <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider mt-0.5">
                          {cat.description || "Premium Care"}
                        </p>
                      </div>
                    </RippleTouch>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Subscription Plans */}
        <SubscriptionShowcase compact />

        {/* 7-Step Ritual Link */}
        <button
          onClick={() => navigate("/ritual")}
          className="mt-5 flex w-full items-center gap-3.5 rounded-2xl border border-accent/20 bg-accent/5 p-4 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <span className="text-base">✦</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-accent">Our 7-Step Ritual</p>
            <p className="text-[10px] text-muted-foreground">Discover how we care for your garments</p>
          </div>
          <ChevronRight className="h-4 w-4 text-accent" />
        </button>
      </div>
      </PullToRefresh>
    </AnimatedPage>
  );
}
