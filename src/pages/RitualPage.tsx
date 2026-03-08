import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const ritualSteps = [
  { num: 1, title: "Inspection", desc: "Each garment is carefully examined for stains, fabric type, and special care requirements.", color: "bg-primary/10 text-primary" },
  { num: 2, title: "Manual Spotting", desc: "Targeted stain removal using specialized eco-friendly solutions matched to fabric type.", color: "bg-accent/10 text-accent" },
  { num: 3, title: "Eco-Wash", desc: "Gentle cleaning with pH-balanced, biodegradable detergents at optimal temperature.", color: "bg-primary/10 text-primary" },
  { num: 4, title: "Gentle Drying", desc: "Temperature-controlled drying to preserve fabric integrity and color vibrancy.", color: "bg-accent/10 text-accent" },
  { num: 5, title: "Hand-Finishing", desc: "Expert pressing and finishing by skilled artisans for a pristine presentation.", color: "bg-primary/10 text-primary" },
  { num: 6, title: "Quality Check", desc: "Multi-point inspection ensuring every garment meets our exacting standards.", color: "bg-accent/10 text-accent" },
  { num: 7, title: "Premium Packaging", desc: "Wrapped in breathable garment bags with cedar sachets for lasting freshness.", color: "bg-primary/10 text-primary" },
];

export default function RitualPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">THE WHITE RABBIT</p>
          <h1 className="text-2xl font-display font-bold text-foreground">7-Step Ritual</h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Every garment entrusted to us undergoes our signature seven-step process, refined over years of caring for the finest fabrics.
      </p>

      {/* Steps */}
      <div className="space-y-5">
        {ritualSteps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-4"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
              <span className="text-sm font-bold">{step.num}</span>
            </div>
            <div className="flex-1 pb-4 border-b border-border last:border-0">
              <p className="text-sm font-semibold text-foreground mb-1">{step.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
