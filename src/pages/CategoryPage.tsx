import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="pb-4">
      {/* Header */}
      <div className="relative bg-foreground px-5 pt-5 pb-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-primary-foreground/80 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-xl font-display font-bold text-primary-foreground">{category.name}</h1>
        <p className="mt-1 text-xs text-primary-foreground/60">{category.description}</p>
      </div>

      {/* Services */}
      <div className="px-5 -mt-4 space-y-3">
        {services.map((svc) => (
          <button
            key={svc.id}
            onClick={() => navigate(`/service/${svc.slug}`)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <span className="text-lg">👔</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                {svc.badge && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-accent/10 text-accent border-0">
                    {svc.badge}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">From ₹{svc.price_standard.toLocaleString()}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
