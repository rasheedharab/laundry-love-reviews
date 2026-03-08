import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  serviceId: string;
  serviceName: string;
  onSubmitted?: () => void;
}

export default function ReviewDialog({ open, onOpenChange, orderId, serviceId, serviceName, onSubmitted }: ReviewDialogProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) { toast.error("Please select a rating"); return; }
    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      order_id: orderId,
      service_id: serviceId,
      rating,
      comment: comment.trim() || null,
    } as any);

    if (error) {
      if (error.code === "23505") {
        toast.error("You've already reviewed this service for this order");
      } else {
        toast.error("Failed to submit review");
      }
    } else {
      toast.success("Thank you for your review!");
      onSubmitted?.();
      onOpenChange(false);
    }
    setSubmitting(false);
  };

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-center">Rate Your Experience</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 mt-2">
          <p className="text-sm text-muted-foreground">{serviceName}</p>

          {/* Star Rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileTap={{ scale: 1.3 }}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredStar || rating)
                      ? "fill-accent text-accent"
                      : "text-border"
                  }`}
                />
              </motion.button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs font-medium text-accent">{labels[rating]}</p>
          )}

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full h-11 rounded-2xl bg-foreground text-primary-foreground"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
