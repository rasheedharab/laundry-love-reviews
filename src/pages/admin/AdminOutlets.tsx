import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface Outlet {
  id: string;
  name: string;
  slug: string;
  address_line: string;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  operating_hours: any;
  created_at: string;
}

const emptyForm = {
  name: "", slug: "", address_line: "", city: "", postal_code: "", phone: "", email: "", is_active: true,
  hours_open: "09:00", hours_close: "21:00",
};

export default function AdminOutlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetch = async () => {
    const { data } = await (supabase as any).from("outlets").select("*").order("name");
    setOutlets(data ?? []);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (o: Outlet) => {
    setForm({
      name: o.name, slug: o.slug, address_line: o.address_line,
      city: o.city ?? "", postal_code: o.postal_code ?? "",
      phone: o.phone ?? "", email: o.email ?? "", is_active: o.is_active,
      hours_open: o.operating_hours?.open ?? "09:00",
      hours_close: o.operating_hours?.close ?? "21:00",
    });
    setEditId(o.id); setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      address_line: form.address_line,
      city: form.city || null,
      postal_code: form.postal_code || null,
      phone: form.phone || null,
      email: form.email || null,
      is_active: form.is_active,
      operating_hours: { open: form.hours_open, close: form.hours_close },
    };
    if (editId) {
      const { error } = await (supabase as any).from("outlets").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Outlet updated");
    } else {
      const { error } = await (supabase as any).from("outlets").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Outlet created");
    }
    setOpen(false); fetch();
  };
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await (supabase as any).from("outlets").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); setDeleteId(null); fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">Outlets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Outlet</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit Outlet" : "New Outlet"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
              </div>
              <div className="space-y-1.5"><Label>Address</Label><Input value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Postal Code</Label><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Opens</Label><Input type="time" value={form.hours_open} onChange={(e) => setForm({ ...form, hours_open: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Closes</Label><Input type="time" value={form.hours_close} onChange={(e) => setForm({ ...form, hours_close: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outlet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outlets.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{o.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.city || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.operating_hours?.open ?? "—"} – {o.operating_hours?.close ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${o.is_active ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                      {o.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {outlets.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No outlets</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
