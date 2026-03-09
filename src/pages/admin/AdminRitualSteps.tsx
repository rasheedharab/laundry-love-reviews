import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import BulkActionBar from "@/components/admin/BulkActionBar";

interface RitualStep {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  icon: string | null;
  color_class: string | null;
  is_active: boolean | null;
}

const emptyForm = {
  step_number: "",
  title: "",
  description: "",
  icon: "sparkles",
  color_class: "bg-primary/10 text-primary",
  is_active: true,
};

export default function AdminRitualSteps() {
  const [steps, setSteps] = useState<RitualStep[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("ritual_steps").select("*").order("step_number");
    setSteps((data as RitualStep[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, step_number: String((steps.length || 0) + 1) });
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (s: RitualStep) => {
    setForm({
      step_number: String(s.step_number),
      title: s.title,
      description: s.description || "",
      icon: s.icon || "sparkles",
      color_class: s.color_class || "bg-primary/10 text-primary",
      is_active: s.is_active ?? true,
    });
    setEditId(s.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = {
      step_number: parseInt(form.step_number) || 1,
      title: form.title,
      description: form.description || null,
      icon: form.icon || null,
      color_class: form.color_class || null,
      is_active: form.is_active,
    };

    if (editId) {
      const { error } = await supabase.from("ritual_steps").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Step updated");
    } else {
      const { error } = await supabase.from("ritual_steps").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Step created");
    }
    setOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("ritual_steps").delete().eq("id", deleteId);
    toast.success("Step deleted");
    setDeleteId(null);
    fetchData();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(selected.size === steps.length ? new Set() : new Set(steps.map((s) => s.id)));
  };

  const bulkSetActive = async (value: boolean) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase
      .from("ritual_steps")
      .update({ is_active: value })
      .in("id", Array.from(selected));
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} step${selected.size > 1 ? "s" : ""} ${value ? "activated" : "deactivated"}`);
    setSelected(new Set());
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ritual Steps</h1>
          <p className="text-sm text-muted-foreground">Manage the 7-step garment care ritual</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Step
        </Button>
      </div>

      <BulkActionBar
        selectedCount={selected.size}
        onActivate={() => bulkSetActive(true)}
        onDeactivate={() => bulkSetActive(false)}
        onClear={() => setSelected(new Set())}
        loading={bulkLoading}
      />

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={steps.length > 0 && selected.size === steps.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Icon</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr
                key={step.id}
                className={`border-t border-border hover:bg-muted/30 ${selected.has(step.id) ? "bg-primary/5" : ""}`}
              >
                <td className="px-4 py-3">
                  <Checkbox checked={selected.has(step.id)} onCheckedChange={() => toggleSelect(step.id)} />
                </td>
                <td className="px-4 py-3 font-bold text-foreground">{step.step_number}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{step.description}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{step.icon}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${step.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {step.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(step)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(step.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {steps.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No ritual steps yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Step" : "Add Step"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Step Number</Label>
                <Input type="number" value={form.step_number} onChange={(e) => setForm({ ...form, step_number: e.target.value })} />
              </div>
              <div>
                <Label>Icon Key</Label>
                <Input placeholder="e.g. sparkles, search, leaf" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Color Class</Label>
              <Input placeholder="e.g. bg-primary/10 text-primary" value={form.color_class} onChange={(e) => setForm({ ...form, color_class: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete ritual step?"
        description="This will permanently remove this step from the ritual."
      />
    </div>
  );
}
