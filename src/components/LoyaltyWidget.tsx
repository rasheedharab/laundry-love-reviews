import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, TrendingUp, TrendingDown, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface PointEntry {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

export default function LoyaltyWidget() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const entries = (data || []) as PointEntry[];
      setHistory(entries);
      setBalance(
        Math.max(0, entries.reduce((s, p) => s + (p.type === "earn" ? p.points : -p.points), 0))
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-2xl glass p-5 animate-pulse">
        <div className="h-4 w-24 rounded bg-muted mb-4" />
        <div className="h-10 w-20 rounded bg-muted mb-3" />
        <div className="space-y-2">
          <div className="h-8 rounded bg-muted" />
          <div className="h-8 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10">
            <Star className="h-4 w-4 text-accent" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loyalty Points</h3>
        </div>
        <Gift className="h-4 w-4 text-muted-foreground/40" />
      </div>

      {/* Balance */}
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-3xl font-display font-bold text-foreground mb-1"
      >
        {balance.toLocaleString()}
      </motion.p>
      <p className="text-[10px] text-muted-foreground mb-4">Available points • ₹{Math.floor(balance / 10)} value</p>

      {/* History */}
      {history.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recent Activity</p>
          <AnimatePresence>
            {history.slice(0, 5).map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  entry.type === "earn" ? "bg-accent/10" : "bg-destructive/10"
                }`}>
                  {entry.type === "earn" ? (
                    <TrendingUp className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {entry.description || (entry.type === "earn" ? "Points earned" : "Points redeemed")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </p>
                </div>
                <span className={`text-xs font-bold ${entry.type === "earn" ? "text-accent" : "text-destructive"}`}>
                  {entry.type === "earn" ? "+" : "-"}{entry.points}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">
          Complete orders to start earning points!
        </p>
      )}
    </div>
  );
}
