import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Tables<"service_categories"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);

  useEffect(() => {
    if (!slug) return;
    supabase.from("service_categories").select("*").eq("slug", slug).single().then(({ data }) => {
      if (data) {
        setCategory(data);
        supabase.from("services").select("*").eq("category_id", data.id).order("sort_order").then(({ data: svc }) => {
          if (svc) setServices(svc);
        });
      }
    });
  }, [slug]);

  if (!category) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="pb-28">
      {/* Hero Card */}
      <div className="relative mx-5 mt-4 h-52 overflow-hidden rounded-2xl bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm">
          <ArrowLeft className="h-4 w-4 text-primary-foreground" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 z-10">
          <h1 className="text-xl font-display font-bold text-primary-foreground">{category.name}</h1>
          <p className="mt-1 text-[11px] text-primary-foreground/60">{category.description}</p>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-5 mt-5 mb-3">
        <p className="section-label">ATELIER SERVICES / Select Treatment</p>
      </div>

      {/* Services List */}
      <div className="px-5 space-y-3">
        {services.map((svc) => (
          <button
            key={svc.id}
            onClick={() => navigate(`/service/${svc.slug}`)}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <span className="text-lg">✦</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                {svc.badge && (
                  <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 bg-accent/10 text-accent border-0 uppercase tracking-wider">
                    {svc.badge}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-accent font-medium">from ₹{svc.price_standard.toLocaleString()}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md px-5 py-3">
        <div className="mx-auto max-w-lg">
          <Button onClick={() => navigate("/cart")} className="w-full h-12 rounded-2xl bg-foreground text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90">
            Arrange Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
