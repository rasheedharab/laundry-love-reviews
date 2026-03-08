import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Wind, Briefcase, Layers, Armchair, Shirt, ChevronRight } from "lucide-react";
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton";
import AnimatedPage from "@/components/AnimatedPage";
import ServiceSearch from "@/components/ServiceSearch";
import { motion } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import RippleTouch from "@/components/RippleTouch";
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

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles, wind: Wind, briefcase: Briefcase, layers: Layers, armchair: Armchair, shirt: Shirt,
};

export default function ServicesHub() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Tables<"service_categories">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("service_categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
      setLoading(false);
    });
  }, []);

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        <h1 className="mb-1 text-2xl font-display font-bold text-foreground">Services</h1>
        <p className="mb-4 text-sm text-muted-foreground">Premium care for everything you own</p>
        <div className="mb-5">
          <ServiceSearch />
        </div>

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
              const img = heroImages[cat.slug] || catDryCleaning;
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
    </AnimatedPage>
  );
}
