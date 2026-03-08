import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;
type Category = Tables<"service_categories">;

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  category_id: "",
  price_standard: "",
  price_express: "",
  turnaround_standard: "3-5 days",
  turnaround_express: "24 hours",
  badge: "",
  image_url: "",
  whats_included: "",
  sort_order: "0",
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const [sRes, cRes] = await Promise.all([
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("service_categories").select("*").order("sort_order"),
    ]);
    setServices(sRes.data ?? []);
    setCategories(cRes.data ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };

  const openEdit = (s: Service) => {
    setForm({
      name: s.name,
      slug: s.slug,
      description: s.description ?? "",
      category_id: s.category_id,
      price_standard: String(s.price_standard),
      price_express: s.price_express ? String(s.price_express) : "",
      turnaround_standard: s.turnaround_standard ?? "3-5 days",
      turnaround_express: s.turnaround_express ?? "24 hours",
      badge: s.badge ?? "",
      image_url: s.image_url ?? "",
      whats_included: (s.whats_included ?? []).join(", "),
      sort_order: String(s.sort_order ?? 0),
    });
    setEditId(s.id);
    setOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `services/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("service-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("service-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = async () => {
    const included = form.whats_included
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description || null,
      category_id: form.category_id,
      price_standard: Number(form.price_standard),
      price_express: form.price_express ? Number(form.price_express) : null,
      turnaround_standard: form.turnaround_standard,
      turnaround_express: form.turnaround_express,
      badge: form.badge || null,
      image_url: form.image_url || null,
      whats_included: included.length > 0 ? included : null,
      sort_order: Number(form.sort_order) || 0,
    };

    if (editId) {
      const { error } = await supabase.from("services").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Service updated");
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Service created");
    }
    setOpen(false);
    fetchData();
  };
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("services").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    setDeleteId(null);
    fetchData();
  };

  const catName = (catId: string) => categories.find((c) => c.id === catId)?.name ?? "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">Services</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Service</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Service" : "New Service"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Price (Standard)</Label>
                  <Input type="number" value={form.price_standard} onChange={(e) => setForm({ ...form, price_standard: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Price (Express)</Label>
                  <Input type="number" value={form.price_express} onChange={(e) => setForm({ ...form, price_express: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Turnaround (Std)</Label>
                  <Input value={form.turnaround_standard} onChange={(e) => setForm({ ...form, turnaround_standard: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Turnaround (Exp)</Label>
                  <Input value={form.turnaround_express} onChange={(e) => setForm({ ...form, turnaround_express: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Badge</Label>
                  <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Popular, New" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Paste URL or upload" className="flex-1" />
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>What's Included (comma-separated)</Label>
                <Textarea value={form.whats_included} onChange={(e) => setForm({ ...form, whats_included: e.target.value })} rows={2} placeholder="e.g. Stain removal, Pressing, Packaging" />
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Std / Exp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Badge</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.name} className="h-10 w-14 object-cover rounded-lg" />
                    ) : (
                      <div className="h-10 w-14 rounded-lg bg-secondary flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{catName(s.category_id)}</td>
                  <td className="px-4 py-3 text-foreground">₹{Number(s.price_standard)}{s.price_express ? ` / ₹${Number(s.price_express)}` : ""}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.badge ?? "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No services</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
