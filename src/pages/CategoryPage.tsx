import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedPage from "@/components/AnimatedPage";
import { toast } from "sonner";
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

const heroTaglines: Record<string, { badge: string; title: string; subtitle: string }> = {
  "party-occasion-wear": {
    badge: "Premium Care",
    title: "Artisanal Cleaning\nfor Your Finest Silks",
    subtitle: "White Rabbit's signature eco-sensitive process for couture items.",
  },
  "dry-cleaning": {
    badge: "Artisan Standards",
    title: "Tailored\nTextile Care",
    subtitle: "The precision of expert craftsmanship applied to your wardrobe essentials.",
  },
  "leather-care": {
    badge: "Exquisite Care",
    title: "Leather\nRevitalization Ritual",
    subtitle: "A multi-stage artisanal process to restore natural oils, pigment, and structural integrity.",
  },
  "carpets-rugs": {
    badge: "Deep Restoration",
    title: "Heritage Carpet\nRevival",
    subtitle: "Specialist cleaning that respects the artistry of your finest rugs.",
  },
  "sofa-care": {
    badge: "Fabric Revival",
    title: "Premium\nUpholstery Care",
    subtitle: "Professional deep cleaning to restore the beauty of your furniture.",
  },
  "laundry": {
    badge: "Daily Essentials",
    title: "Pristine\nWash & Fold",
    subtitle: "Premium laundering with meticulous attention to fabric care.",
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
    });
    toast.success(`${svc.name} added to cart`);
  };

  const heroImg = heroImages[slug || ""] || catDryCleaning;
  const tagline = heroTaglines[slug || ""] || heroTaglines["dry-cleaning"];

  if (!category && loading) {
    return (
      <div className="px-5 pt-6 space-y-4">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
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

          {/* Services List — card style with images */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => navigate(`/service/${svc.slug}`)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition-shadow hover:shadow-md"
                >
                  {/* Service thumbnail */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {svc.image_url ? (
                      <img src={svc.image_url} alt={svc.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-2xl opacity-30">✦</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">{svc.name}</p>
                    {svc.badge && (
                      <Badge className="mb-1 bg-accent/10 text-accent border-0 text-[8px] uppercase tracking-wider font-bold px-2 py-0.5">
                        {svc.badge}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Starting from <span className="text-accent font-semibold">₹{Number(svc.price_standard).toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Quick add button */}
                  <div
                    onClick={(e) => { e.stopPropagation(); handleQuickAdd(svc); }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary hover:bg-accent/10 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
