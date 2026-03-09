import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserSub {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
  created_at: string | null;
  plan_name?: string;
  user_email?: string;
  user_name?: string;
}

const STATUS_OPTIONS = ["active", "cancelled", "expired", "paused"] as const;

const statusColor: Record<string, string> = {
  active: "bg-accent/15 text-accent border-accent/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-border",
  paused: "bg-secondary text-foreground border-border",
};

export default function AdminUserSubscriptions() {
  const [subs, setSubs] = useState<UserSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<UserSub | null>(null);
  const [formStatus, setFormStatus] = useState("active");
  const [formStartsAt, setFormStartsAt] = useState<Date | undefined>();
  const [formEndsAt, setFormEndsAt] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    // Fetch subscriptions with plan name
    const { data: subData } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_plans(name)")
      .order("created_at", { ascending: false });

    if (!subData) { setSubs([]); setLoading(false); return; }

    // Fetch profiles for user names
    const userIds = [...new Set(subData.map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p.full_name]));

    const mapped: UserSub[] = subData.map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      plan_id: s.plan_id,
      status: s.status,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      created_at: s.created_at,
      plan_name: s.subscription_plans?.name || "Unknown",
      user_name: profileMap.get(s.user_id) || "—",
    }));

    setSubs(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const openEdit = (sub: UserSub) => {
    setEditing(sub);
    setFormStatus(sub.status);
    setFormStartsAt(new Date(sub.starts_at));
    setFormEndsAt(sub.ends_at ? new Date(sub.ends_at) : undefined);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: formStatus,
        starts_at: formStartsAt?.toISOString() || editing.starts_at,
        ends_at: formEndsAt?.toISOString() || null,
      })
      .eq("id", editing.id);

    if (error) toast.error(error.message);
    else { toast.success("Subscription updated"); setEditing(null); fetchSubs(); }
    setSaving(false);
  };

  const filtered = subs.filter(s => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.user_name?.toLowerCase().includes(q) ||
      s.plan_name?.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q) ||
      s.user_id.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">User Subscriptions</h1>
          <p className="text-sm text-muted-foreground">{subs.length} subscriptions</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, plan…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No subscriptions found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-4 bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">{s.user_name}</p>
                  <Badge variant="outline" className={cn("text-[9px] capitalize", statusColor[s.status] || "")}>
                    {s.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.plan_name} · Started {format(new Date(s.starts_at), "dd MMM yyyy")}
                  {s.ends_at && ` · Ends ${format(new Date(s.ends_at), "dd MMM yyyy")}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-sm font-semibold text-foreground">{editing.user_name}</p>
                <p className="text-xs text-muted-foreground">{editing.plan_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formStartsAt && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formStartsAt ? format(formStartsAt, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formStartsAt} onSelect={setFormStartsAt} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formEndsAt && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formEndsAt ? format(formEndsAt, "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formEndsAt} onSelect={setFormEndsAt} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                {formEndsAt && (
                  <button onClick={() => setFormEndsAt(undefined)} className="text-xs text-muted-foreground hover:text-foreground mt-1">
                    Clear end date
                  </button>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving…" : "Update Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
