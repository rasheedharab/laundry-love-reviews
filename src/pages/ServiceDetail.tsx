import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check, Clock, Zap, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import ServiceReviews from "@/components/ServiceReviews";
import type { Tables } from "@/integrations/supabase/types";

import serviceHeroDefault from "@/assets/service-hero-default.jpg";
import catPartyWear from "@/assets/cat-party-wear.jpg";
import catDryCleaning from "@/assets/cat-dry-cleaning.jpg";
import catLaundry from "@/assets/cat-laundry.jpg";
import catLeatherCare from "@/assets/cat-leather-care.jpg";
import catCarpets from "@/assets/cat-carpets.jpg";
import catSofaCare from "@/assets/cat-sofa-care.jpg";

const heroImageMap: Record<string, string> = {
  "party-wear": catPartyWear,
  "dry-cleaning": catDryCleaning,
  laundry: catLaundry,
  "leather-care": catLeatherCare,
  carpets: catCarpets,
  "sofa-care": catSofaCare,
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [service, setService] = useState<Tables<"services"> | null>(null);
  const [category, setCategory] = useState<Tables<"service_categories"> | null>(null);
  const [tier, setTier] = useState<"standard" | "express">("standard");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const headerOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);

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
        <div className="relative min-h-[380px] bg-foreground">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="px-5 -mt-8 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  const price = tier === "express" && service.price_express ? service.price_express : service.price_standard;
  const turnaround = tier === "express" ? service.turnaround_express : service.turnaround_standard;
  const categorySlug = category?.slug || "";
  const heroImage = heroImageMap[categorySlug] || serviceHeroDefault;

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
      <div className="pb-28">
        {/* Sticky header that reveals on scroll */}
        <motion.div
          style={{ opacity: headerOpacity }}
          className="fixed top-0 left-0 right-0 z-50 glass px-5 py-3"
        >
          <div className="mx-auto max-w-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <ArrowLeft className="h-4 w-4 text-foreground" />
              </button>
              <p className="text-sm font-display font-bold text-foreground truncate">{service.name}</p>
            </div>
            <p className="text-sm font-bold text-accent">₹{price.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Full-bleed Hero Image with Parallax */}
        <div ref={heroRef} className="relative min-h-[400px] overflow-hidden">
          <motion.img
            src={service.image_url || heroImage}
            alt={service.name}
            className="absolute inset-0 h-[130%] w-full object-cover"
            style={{ y: heroY, scale: heroScale }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-transparent to-transparent" />

          <button
            onClick={() => navigate(-1)}
            className="absolute top-5 left-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/20 backdrop-blur-md border border-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 text-primary-foreground" />
          </button>

          {service.badge && (
            <div className="absolute top-5 right-5 z-10">
              <Badge className="bg-accent/90 text-accent-foreground border-0 backdrop-blur-sm text-[10px] tracking-wider uppercase px-3 py-1">
                {service.badge}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 px-5 pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-2">
              {category?.name || "Premium Care"}
            </p>
            <h1 className="text-3xl font-display font-bold text-foreground leading-tight mb-2">
              {service.name}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-xs font-medium text-foreground">4.9</span>
              </div>
              <span className="text-muted-foreground text-[10px]">•</span>
              <span className="text-xs text-muted-foreground">{turnaround || "48h turnaround"}</span>
            </div>
          </div>
        </div>

        <div className="px-5 -mt-2 relative z-10">
          {/* Description */}
          <div className="rounded-2xl glass p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Artisan Care</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{service.description}</p>
          </div>

          {/* Tier Selection with glow */}
          <div className="mb-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Service Tier</h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => setTier("standard")}
                whileTap={{ scale: 0.97 }}
                className={`relative rounded-2xl p-5 text-left transition-all glass ${
                  tier === "standard" ? "border-2 border-primary/50 tier-glow" : ""
                }`}
              >
                <AnimatePresence>
                  {tier === "standard" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Standard</p>
                <p className="text-xl font-display font-bold text-foreground">₹{service.price_standard.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{service.turnaround_standard}</p>
              </motion.button>

              {service.price_express && (
                <motion.button
                  onClick={() => setTier("express")}
                  whileTap={{ scale: 0.97 }}
                  className={`relative rounded-2xl p-5 text-left transition-all glass ${
                    tier === "express" ? "border-2 border-accent/50 tier-glow-express" : ""
                  }`}
                >
                  <AnimatePresence>
                    {tier === "express" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-3 right-3 h-5 w-5 rounded-full bg-accent flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-accent-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-accent" />
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Express</p>
                  <p className="text-xl font-display font-bold text-foreground">₹{service.price_express.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{service.turnaround_express}</p>
                </motion.button>
              )}
            </div>
          </div>

          {/* What's Included */}
          {service.whats_included && service.whats_included.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">What's Included</h3>
              <div className="rounded-2xl glass p-5 space-y-3">
                {service.whats_included.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Check className="h-3 w-3 text-accent" />
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <span className="text-base">✦</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-accent">Our 7-Step Ritual</p>
              <p className="text-[10px] text-muted-foreground">See how we care for your garments</p>
            </div>
            <ArrowLeft className="h-4 w-4 text-accent rotate-180" />
          </button>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-16 left-0 right-0 z-40 glass px-5 py-3">
          <div className="mx-auto max-w-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-2xl font-display font-bold text-foreground">₹{price.toLocaleString()}</p>
            </div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button onClick={handleAdd} className="h-12 rounded-xl px-8 text-sm font-semibold shadow-lg">
                Add to Bag
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
