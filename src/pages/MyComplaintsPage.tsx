import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AnimatedPage from "@/components/AnimatedPage";
import ComplaintDialog from "@/components/ComplaintDialog";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Complaint = Tables<"complaints">;

const statusConfig: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  open: { label: "Open", icon: AlertCircle, class: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "in-progress": { label: "In Progress", icon: Clock, class: "bg-primary/10 text-primary border-primary/20" },
  resolved: { label: "Resolved", icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  closed: { label: "Closed", icon: XCircle, class: "bg-muted text-muted-foreground border-border" },
};

const priorityClass: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-foreground",
  high: "text-amber-600",
  urgent: "text-destructive font-semibold",
};

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchComplaints = () => {
    if (!user) return;
    supabase
      .from("complaints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setComplaints(data ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchComplaints(); }, [user]);

  const getStatus = (s: string) => statusConfig[s] ?? statusConfig.open;

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground flex-1">My Complaints</h1>
          <ComplaintDialog>
            <Button size="sm" className="rounded-2xl text-xs">New Complaint</Button>
          </ComplaintDialog>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-1">No complaints yet</p>
            <p className="text-xs text-muted-foreground">We hope it stays that way!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => {
              const st = getStatus(c.status);
              const Icon = st.icon;
              const isExpanded = expanded === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => setExpanded(isExpanded ? null : c.id)}
                  className="w-full text-left rounded-2xl glass p-4 transition-all hover:bg-secondary/50"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "currentColor" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{c.subject}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${st.class}`}>
                          {st.label}
                        </Badge>
                        <span className={`text-[10px] uppercase tracking-wider ${priorityClass[c.priority] ?? ""}`}>
                          {c.priority}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-1">
                      {format(new Date(c.created_at), "MMM d")}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-border space-y-3">
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                      {c.admin_notes && (
                        <div className="rounded-xl bg-secondary/50 p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Admin Response</p>
                          <p className="text-sm text-foreground">{c.admin_notes}</p>
                        </div>
                      )}
                      {c.resolved_at && (
                        <p className="text-[10px] text-muted-foreground">
                          Resolved on {format(new Date(c.resolved_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
