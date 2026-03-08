import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Wind, Briefcase, Layers, Armchair, Shirt, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimation";
import AnimatedPage from "@/components/AnimatedPage";
import type { Tables } from "@/integrations/supabase/types";

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
        <p className="mb-6 text-sm text-muted-foreground">Premium care for everything you own</p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : (
          <StaggerContainer className="space-y-3">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon || "sparkles"] || Sparkles;
              return (
                <StaggerItem key={cat.id}>
                  <button
                    onClick={() => navigate(`/services/${cat.slug}`)}
                    className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
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
