import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RitualStep {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  color_class: string | null;
}

export default function RitualPage() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<RitualStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ritual_steps")
      .select("id, step_number, title, description, color_class")
      .eq("is_active", true)
      .order("step_number")
      .then(({ data }) => {
        setSteps((data as RitualStep[]) || []);
        setLoading(false);
      });
  }, []);

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
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2 pb-4">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${step.color_class || "bg-primary/10 text-primary"}`}>
                <span className="text-sm font-bold">{step.step_number}</span>
              </div>
              <div className="flex-1 pb-4 border-b border-border last:border-0">
                <p className="text-sm font-semibold text-foreground mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
