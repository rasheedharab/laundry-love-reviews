import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

const statuses = ["open", "in-progress", "resolved", "closed"];
const priorities = ["low", "medium", "high", "urgent"];

const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/10 text-yellow-700",
  high: "bg-orange-500/10 text-orange-700",
  urgent: "bg-destructive/10 text-destructive",
};

const statusColor: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-700",
  "in-progress": "bg-yellow-500/10 text-yellow-700",
  resolved: "bg-green-500/10 text-green-700",
  closed: "bg-muted text-muted-foreground",
};

interface Complaint {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const fetchComplaints = async () => {
    let query = (supabase as any).from("complaints").select("*").order("created_at", { ascending: false }).limit(100);
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    const { data } = await query;
    setComplaints(data ?? []);
  };

  useEffect(() => { fetchComplaints(); }, [filterStatus]);

  const openDetail = (c: Complaint) => {
    setSelected(c);
    setNotes(c.admin_notes ?? "");
    setNewStatus(c.status);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const payload: any = { status: newStatus, admin_notes: notes || null };
    if (newStatus === "resolved" && selected.status !== "resolved") payload.resolved_at = new Date().toISOString();
    const { error } = await (supabase as any).from("complaints").update(payload).eq("id", selected.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Complaint updated");
    setSelected(null);
    fetchComplaints();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">Complaints</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{c.subject}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={priorityColor[c.priority]}>{c.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={statusColor[c.status]}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.order_id ? `#WR-${c.order_id.slice(0, 6).toUpperCase()}` : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(c)} className="gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No complaints</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Complaint Detail</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{selected.subject}</p>
                <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Badge variant="secondary" className={`${priorityColor[selected.priority]} mt-2`}>{selected.priority}</Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Admin Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
              <Button onClick={handleUpdate} className="w-full">Update Complaint</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
