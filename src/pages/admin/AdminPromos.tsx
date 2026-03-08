import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Promo = Tables<"promo_codes">;

const emptyForm = { code: "", discount_percent: "", discount_amount: "", expires_at: "" };

export default function AdminPromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setPromos(data ?? []);
  };

  useEffect(() => { fetch(); }, []);

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
    fetch();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !current }).eq("id", id);
    fetch();
  };
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("promo_codes").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    setDeleteId(null);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
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
              {promos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No promo codes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
