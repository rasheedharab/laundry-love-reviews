import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function ServiceReviews({ serviceId }: { serviceId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at")
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        const items = (data as Review[]) || [];
        setReviews(items);
        if (items.length > 0) {
          setAvg(items.reduce((s, r) => s + r.rating, 0) / items.length);
        }
      });
  }, [serviceId]);

  if (reviews.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Reviews</h3>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="text-xs font-bold text-foreground">{avg.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">({reviews.length})</span>
        </div>
      </div>
      <div className="space-y-2">
        {reviews.slice(0, 3).map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-accent text-accent" : "text-border"}`} />
              ))}
              <span className="text-[10px] text-muted-foreground ml-2">
                {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
            {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
