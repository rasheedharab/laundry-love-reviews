import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ListSkeleton from "@/components/skeletons/ListSkeleton";
import AnimatedPage from "@/components/AnimatedPage";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";
import { serviceImages } from "@/lib/serviceImages";

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

const defaultTagline = { badge: "Premium Care", title: "Expert\nGarment Care", subtitle: "Professional cleaning services for your finest garments." };

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [category, setCategory] = useState<Tables<"service_categories"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from("service_categories").select("*").eq("slug", slug).single().then(({ data }) => {
      if (data) {
        setCategory(data);
        supabase.from("services").select("*").eq("category_id", data.id).order("sort_order").then(({ data: svc }) => {
          if (svc) setServices(svc);
          setLoading(false);
        });
      }
    });
  }, [slug]);

  const handleQuickAdd = (svc: Tables<"services">) => {
    addItem({
      serviceId: svc.id,
      serviceName: svc.name,
      categoryName: category?.name || "",
      price: Number(svc.price_standard),
      tier: "standard",
      turnaround: svc.turnaround_standard || "3-5 days",
      priceExpress: svc.price_express ?? null,
      turnaroundStandard: svc.turnaround_standard,
      turnaroundExpress: svc.turnaround_express,
    });
    toast.success(`${svc.name} added to cart`);
  };

  const heroImg = category?.image_url || heroImages[slug || ""] || catDryCleaning;
  const tagline = {
    badge: category?.tagline_badge || defaultTagline.badge,
    title: category?.tagline_title || defaultTagline.title,
    subtitle: category?.tagline_subtitle || defaultTagline.subtitle,
  };

  if (!category && loading) {
    return (
      <div className="px-5 pt-6 space-y-4">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-4 w-32 rounded-lg" />
        <ListSkeleton count={3} height="h-24" showAvatar />
      </div>
    );
  }

  if (!category) return null;

  return (
    <AnimatedPage>
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{category.name}</h1>
          <button onClick={() => navigate("/cart")} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Hero Image Section */}
        <div className="relative mx-5 overflow-hidden rounded-2xl">
          <img src={heroImg} alt={category.name} className="h-80 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge className="mb-3 bg-accent text-accent-foreground border-0 text-[10px] uppercase tracking-wider font-bold px-3 py-1">
              {tagline.badge}
            </Badge>
            <h2 className="text-2xl font-display font-bold text-primary-foreground leading-tight whitespace-pre-line mb-2">
              {tagline.title}
            </h2>
            <p className="text-xs text-primary-foreground/70 leading-relaxed max-w-[280px]">
              {tagline.subtitle}
            </p>
          </div>
        </div>

        {/* Explore Ritual Button (for select categories) */}
        {(slug === "leather-care" || slug === "party-occasion-wear") && (
          <div className="px-5 mt-4">
            <Button
              onClick={() => navigate("/ritual")}
              className="w-full h-12 rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent/90"
            >
              Explore the Ritual
            </Button>
          </div>
        )}

        {/* Services Section */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">Our Services</h3>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {category.description || "Premium Care"}
              </p>
            </div>
            <button
              onClick={() => navigate("/services")}
              className="text-xs font-semibold text-accent uppercase tracking-wider"
            >
              View All
            </button>
          </div>

          {/* Services List — staggered card animations */}
          {loading ? (
            <ListSkeleton count={3} height="h-[140px]" showAvatar />
          ) : (
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {services.map((svc, index) => (
                <motion.button
                  key={svc.id}
                  variants={cardVariants}
                  onClick={() => navigate(`/service/${svc.slug}`)}
                  className="relative w-full overflow-hidden rounded-2xl text-left group glass-hover"
                  style={{ minHeight: "140px" }}
                >
                  {/* Background image */}
                  <img
                    src={svc.image_url || serviceImages[svc.slug] || heroImg}
                    alt={svc.name}
                    className="absolute inset-0 h-full w-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Gradient overlay — alternating directions */}
                  <div
                    className={`absolute inset-0 ${
                      index % 2 === 0
                        ? "bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/20"
                        : "bg-gradient-to-l from-foreground/85 via-foreground/60 to-foreground/20"
                    }`}
                  />

                  {/* Glass border effect */}
                  <div className="absolute inset-0 rounded-2xl border border-white/10" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full min-h-[140px] flex-col justify-between p-5">
                    <div>
                      {svc.badge && (
                        <Badge className="mb-2 glass-sm border-white/20 bg-white/10 text-primary-foreground text-[8px] uppercase tracking-wider font-bold px-2.5 py-0.5">
                          {svc.badge}
                        </Badge>
                      )}
                      <h4 className="text-lg font-display font-bold text-primary-foreground leading-tight">
                        {svc.name}
                      </h4>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/50 mb-0.5">
                          Starting from
                        </p>
                        <p className="text-xl font-display font-bold text-primary-foreground">
                          ₹{Number(svc.price_standard).toLocaleString()}
                        </p>
                        {svc.turnaround_standard && (
                          <p className="text-[10px] text-primary-foreground/40 mt-0.5">
                            {svc.turnaround_standard}
                          </p>
                        )}
                      </div>

                      {/* Quick add button */}
                      <div
                        onClick={(e) => { e.stopPropagation(); handleQuickAdd(svc); }}
                        className="flex h-11 w-11 items-center justify-center rounded-full glass-accent border-white/20 hover:scale-110 transition-transform"
                      >
                        <Plus className="h-5 w-5 text-accent-foreground" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
