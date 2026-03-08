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

interface Tier {
  id: string;
  name: string;
  price: string;
  period: string | null;
  icon: string | null;
  features: any;
  is_popular: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
}

const emptyForm = { name: "", price: "", period: "/mo", icon: "star", features: "[]", is_popular: false, is_active: true, sort_order: "0" };

export default function AdminMembershipTiers() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("membership_tiers").select("*").order("sort_order");
    setTiers((data as Tier[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };

  const openEdit = (t: Tier) => {
    const features = Array.isArray(t.features) ? t.features : [];
    setForm({
      name: t.name,
      price: t.price,
      period: t.period || "/mo",
      icon: t.icon || "star",
      features: features.join("\n"),
      is_popular: t.is_popular ?? false,
      is_active: t.is_active ?? true,
      sort_order: String(t.sort_order ?? 0),
    });
    setEditId(t.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) { toast.error("Name and price required"); return; }
    const featuresArr = form.features.split("\n").map((f: string) => f.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      price: form.price,
      period: form.period || null,
      icon: form.icon || null,
      features: featuresArr,
      is_popular: form.is_popular,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editId) {
      const { error } = await supabase.from("membership_tiers").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Tier updated");
    } else {
      const { error } = await supabase.from("membership_tiers").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Tier created");
    }
    setOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("membership_tiers").delete().eq("id", deleteId);
    toast.success("Tier deleted");
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Membership Tiers</h1>
          <p className="text-sm text-muted-foreground">Manage White Rabbit Club membership plans</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Tier
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Features</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => {
              const features = Array.isArray(tier.features) ? tier.features : [];
              return (
                <tr key={tier.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{tier.sort_order}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{tier.name}</p>
                    {tier.is_popular && <span className="text-[10px] font-bold uppercase text-accent">Popular</span>}
                  </td>
                  <td className="px-4 py-3 text-foreground">{tier.price}<span className="text-muted-foreground text-xs">{tier.period}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{features.length} features</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tier.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {tier.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(tier)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(tier.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {tiers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No membership tiers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Tier" : "Add Tier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. ₹499" />
              </div>
              <div>
                <Label>Period</Label>
                <Input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="/mo" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon Key</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="star, crown, diamond" />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder="Free pickup & delivery&#10;Priority processing&#10;10% discount on all services" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_popular} onCheckedChange={(v) => setForm({ ...form, is_popular: v })} />
                <Label>Popular</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
