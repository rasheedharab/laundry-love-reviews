import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface CareTip {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

const emptyForm = { title: "", description: "", icon: "scissors", sort_order: "0", is_active: true };

export default function AdminCareTips() {
  const [tips, setTips] = useState<CareTip[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("care_tips").select("*").order("sort_order");
    setTips((data as CareTip[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };

  const openEdit = (t: CareTip) => {
    setForm({
      title: t.title,
      description: t.description,
      icon: t.icon || "scissors",
      sort_order: String(t.sort_order ?? 0),
      is_active: t.is_active ?? true,
    });
    setEditId(t.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error("Title and description required"); return; }
    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    };

    if (editId) {
      const { error } = await supabase.from("care_tips").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Tip updated");
    } else {
      const { error } = await supabase.from("care_tips").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Tip created");
    }
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this care tip?")) return;
    await supabase.from("care_tips").delete().eq("id", id);
    toast.success("Tip deleted");
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Care Tips</h1>
          <p className="text-sm text-muted-foreground">Manage garment care tips shown on the homepage</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Tip
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Icon</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tips.map((tip) => (
              <tr key={tip.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{tip.sort_order}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{tip.description}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{tip.icon}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tip.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {tip.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(tip)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tip.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {tips.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No care tips yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Tip" : "Add Tip"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon Key</Label>
                <Input placeholder="e.g. scissors, briefcase, wind" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
