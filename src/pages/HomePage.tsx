import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, ChevronDown, Sparkles, Wind, Briefcase, Layers, Armchair, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import type { Tables } from "@/integrations/supabase/types";

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  wind: Wind,
  briefcase: Briefcase,
  layers: Layers,
  armchair: Armchair,
  shirt: Shirt,
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Tables<"service_categories">[]>([]);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    supabase.from("service_categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) setProfile(data);
      });
    }
  }, [user]);

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground">Good day,</p>
          <p className="text-base font-semibold text-foreground">{profile?.full_name || "Guest"}</p>
        </div>
        <button className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
          <MapPin className="h-3 w-3" />
          Mumbai
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-foreground p-6 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="mb-1 text-xl font-display font-bold leading-tight">Expert care for<br />your wardrobe</h1>
          <p className="mb-4 text-xs opacity-80">Premium cleaning & garment preservation</p>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/services")}
              className="h-9 rounded-lg bg-accent text-accent-foreground text-xs font-semibold px-5 hover:bg-accent/90"
            >
              Book Now
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/ritual")}
              className="h-9 rounded-lg border-primary-foreground/30 text-primary-foreground text-xs font-semibold px-4 hover:bg-primary-foreground/10 bg-transparent"
            >
              Our 7-Step Ritual
            </Button>
          </div>
        </div>
        <img src={logoImg} alt="" className="absolute -right-4 -bottom-4 h-28 w-28 opacity-10" />
      </div>

      {/* Active Order Banner (mock) */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">No active orders</p>
          <p className="text-[11px] text-muted-foreground">Book a service to get started</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg" onClick={() => navigate("/services")}>
          Browse
        </Button>
      </div>

      {/* Services Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-display font-semibold text-foreground">Our Services</h2>
        <button onClick={() => navigate("/services")} className="text-xs text-primary font-medium">View all</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon || "sparkles"] || Sparkles;
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/services/${cat.slug}`)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-foreground text-center leading-tight">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Brand Footer */}
      <div className="mt-8 flex justify-center">
        <img src={logoImg} alt="White Rabbit" className="h-10 opacity-20" />
      </div>
    </div>
  );
}
