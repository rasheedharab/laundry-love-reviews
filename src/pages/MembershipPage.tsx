import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Silver",
    price: "₹499",
    period: "/month",
    features: ["5% off all services", "Priority scheduling", "Free garment bags", "Email support"],
    popular: false,
  },
  {
    name: "Gold",
    price: "₹999",
    period: "/month",
    features: ["15% off all services", "Same-day express", "Free pickup & delivery", "Dedicated concierge", "Seasonal wardrobe check"],
    popular: true,
  },
  {
    name: "Platinum",
    price: "₹1,999",
    period: "/month",
    features: ["25% off all services", "Priority express (6hr)", "Unlimited free delivery", "Personal valet", "Wardrobe consultation", "VIP event access"],
    popular: false,
  },
];

const clubBenefits = [
  "Exclusive member pricing on premium treatments",
  "Early access to seasonal care programs",
  "Complimentary garment storage during travel",
  "Birthday month: one free premium service",
];

export default function MembershipPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Premium Card */}
      <div className="mx-5 mb-6 rounded-2xl bg-gradient-to-br from-accent to-primary p-6 text-accent-foreground">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-80 mb-1">WHITE RABBIT</p>
        <h1 className="text-xl font-display font-bold mb-2">Premium Club</h1>
        <p className="text-xs opacity-70 leading-relaxed">Elevate your garment care with exclusive benefits, priority service, and dedicated concierge support.</p>
      </div>

      {/* Tiers */}
      <div className="px-5 space-y-4 mb-8">
        <p className="section-label">SELECT YOUR TIER</p>
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border-2 p-5 transition-all ${
              tier.popular ? "border-accent bg-accent/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className={`h-4 w-4 ${tier.popular ? "text-accent" : "text-muted-foreground"}`} />
                <span className="text-base font-display font-bold text-foreground">{tier.name}</span>
              </div>
              {tier.popular && (
                <Badge className="bg-accent text-accent-foreground border-0 text-[8px] uppercase tracking-wider">
                  Most Popular
                </Badge>
              )}
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-foreground">{tier.price}</span>
              <span className="text-xs text-muted-foreground">{tier.period}</span>
            </div>
            <div className="space-y-2 mb-4">
              {tier.features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className={`h-3.5 w-3.5 ${tier.popular ? "text-accent" : "text-primary"}`} />
                  <span className="text-xs text-foreground">{f}</span>
                </div>
              ))}
            </div>
            <Button
              className={`w-full h-10 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                tier.popular
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-foreground text-primary-foreground hover:bg-foreground/90"
              }`}
            >
              Select {tier.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Club Ritual Benefits */}
      <div className="px-5 mb-6">
        <p className="section-label mb-3">THE CLUB RITUAL</p>
        <div className="space-y-3">
          {clubBenefits.map((b) => (
            <div key={b} className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5">
        <Button className="w-full h-12 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold uppercase tracking-wider hover:bg-accent/90">
          Join the Club
        </Button>
      </div>
    </div>
  );
}
