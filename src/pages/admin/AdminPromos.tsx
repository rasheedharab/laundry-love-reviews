import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import BulkActionBar from "@/components/admin/BulkActionBar";
import type { Tables } from "@/integrations/supabase/types";

type Promo = Tables<"promo_codes">;

const emptyForm = { code: "", discount_percent: "", discount_amount: "", expires_at: "" };

export default function AdminPromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setPromos(data ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = promos.filter((p) =>
    !search.trim() || p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    const payload: any = {
      code: form.code.toUpperCase(),
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      discount_amount: form.discount_amount ? Number(form.discount_amount) : null,
      expires_at: form.expires_at || null,
    };
    const { error } = await supabase.from("promo_codes").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Promo created");
    setOpen(false);
    setForm(emptyForm);
    fetchData();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !current }).eq("id", id);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("promo_codes").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
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
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id)));
  };

  const bulkSetActive = async (value: boolean) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("promo_codes").update({ is_active: value }).in("id", Array.from(selected));
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} promo${selected.size > 1 ? "s" : ""} ${value ? "activated" : "deactivated"}`);
    setSelected(new Set());
    fetchData();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("promo_codes").delete().in("id", Array.from(selected));
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} promo${selected.size > 1 ? "s" : ""} deleted`);
    setSelected(new Set());
    setConfirmBulkDelete(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display font-bold text-foreground">Promo Codes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Promo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE20" className="uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Discount %</Label>
                  <Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Flat ₹ Off</Label>
                  <Input type="number" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Expires At</Label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search promo codes…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(new Set()); }}
        />
      </div>

      <BulkActionBar
        selectedCount={selected.size}
        onActivate={() => bulkSetActive(true)}
        onDeactivate={() => bulkSetActive(false)}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => setSelected(new Set())}
        loading={bulkLoading}
      />

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-border last:border-0 ${selected.has(p.id) ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{p.code}</td>
                  <td className="px-4 py-3 text-foreground">
                    {p.discount_percent ? `${p.discount_percent}%` : p.discount_amount ? `₹${p.discount_amount}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={p.is_active ?? false} onCheckedChange={() => toggleActive(p.id, p.is_active ?? false)} />
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "No promo codes match your search" : "No promo codes"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete promo code?"
        description="This will permanently remove this promo code."
      />
      <ConfirmDeleteDialog
        open={confirmBulkDelete}
        onOpenChange={(open) => !open && setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
        loading={bulkLoading}
        title={`Delete ${selected.size} promo${selected.size > 1 ? "s" : ""}?`}
        description="This will permanently delete the selected promo codes."
      />
    </div>
  );
}
