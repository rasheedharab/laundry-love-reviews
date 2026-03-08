import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Star, Crown, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ComponentType<any>> = {
  star: Star,
  crown: Crown,
  diamond: Diamond,
};

interface Tier {
  id: string;
  name: string;
  price: string;
  period: string;
  icon: string;
  features: string[];
  is_popular: boolean;
}

interface ClubStep { id: string; title: string; description: string | null; icon: string | null; step_number: number; }

export default function MembershipPage() {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [clubSteps, setClubSteps] = useState<ClubStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("membership_tiers").select("id, name, price, period, icon, features, is_popular").eq("is_active", true).order("sort_order"),
      supabase.from("ritual_steps").select("id, step_number, title, description, icon").eq("is_active", true).order("step_number").limit(2),
    ]).then(([tiersRes, stepsRes]) => {
      setTiers((tiersRes.data as any) || []);
      setClubSteps((stepsRes.data as ClubStep[]) || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">White Rabbit Club</h1>
        <div className="w-10" />
      </div>

      {/* Premium Hero Card */}
      <div className="mx-5 mb-6 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 p-6 text-white relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <span className="text-2xl">🐇</span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Premium</span>
        </div>
        <div className="pt-10">
          <p className="text-xs opacity-80 mb-1">Exclusive Member</p>
          <p className="text-lg font-display font-bold">White Rabbit Club</p>
        </div>
      </div>

      {/* Membership Tiers */}
      <div className="px-5 mb-8">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">Membership Tiers</h2>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-border p-5 space-y-3">
                <Skeleton className="h-5 w-1/3 rounded-lg" />
                <Skeleton className="h-8 w-1/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))
          ) : (
            tiers.map((tier) => {
              const IconComp = iconMap[tier.icon] || Star;
              const features = Array.isArray(tier.features) ? tier.features : [];
              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl border-2 p-5 relative ${
                    tier.is_popular ? "border-accent bg-accent/5" : "border-border bg-card"
                  }`}
                >
                  {tier.is_popular && (
                    <Badge className="absolute -top-2.5 right-4 bg-accent text-accent-foreground border-0 text-[9px] uppercase tracking-wider font-bold px-2.5">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-display font-bold text-foreground">{tier.name}</p>
                    <IconComp className={`h-5 w-5 ${tier.is_popular ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                  <div className="space-y-2.5 mb-5">
                    {features.map((f: string) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          tier.is_popular ? "bg-accent/20" : "bg-secondary"
                        }`}>
                          <Check className={`h-3 w-3 ${tier.is_popular ? "text-accent" : "text-primary"}`} />
                        </div>
                        <span className="text-sm text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider ${
                      tier.is_popular
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-foreground text-primary-foreground hover:bg-foreground/90"
                    }`}
                  >
                    Select {tier.name}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* The Club Ritual */}
      <div className="px-5 mb-8">
        <h2 className="text-lg font-display font-bold text-foreground text-center mb-5">The Club Ritual</h2>
        <div className="space-y-4">
          {ritualSteps.map((step) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <span className="text-xl">{step.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5">
        <Button className="w-full h-13 rounded-2xl bg-accent text-accent-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent/90">
          Join the Club
        </Button>
      </div>
    </div>
  );
}
