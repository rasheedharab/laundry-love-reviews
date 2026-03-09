import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Search } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import BulkActionBar from "@/components/admin/BulkActionBar";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"service_categories">;

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  image_url: "",
  sort_order: "0",
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("service_categories").select("*").order("sort_order");
    setCategories(data ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = categories.filter((c) =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };

  const openEdit = (c: Category) => {
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      icon: c.icon ?? "",
      image_url: c.image_url ?? "",
      sort_order: String(c.sort_order ?? 0),
    });
    setEditId(c.id);
    setOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `categories/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("service-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("service-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description || null,
      icon: form.icon || null,
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order) || 0,
    };
    if (editId) {
      const { error } = await supabase.from("service_categories").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Category updated");
    } else {
      const { error } = await supabase.from("service_categories").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Category created");
    }
    setOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("service_categories").delete().eq("id", deleteId);
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
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((c) => c.id)));
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("service_categories").delete().in("id", Array.from(selected));
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} categor${selected.size > 1 ? "ies" : "y"} deleted`);
    setSelected(new Set());
    setConfirmBulkDelete(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display font-bold text-foreground">Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 👔" /></div>
                <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Paste URL or upload" className="flex-1" />
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}><Upload className="h-4 w-4" /></Button>
                </div>
                {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl" />}
              </div>
              <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(new Set()); }}
        />
      </div>

      <BulkActionBar
        selectedCount={selected.size}
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={`border-b border-border last:border-0 ${selected.has(c.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3">
                    <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                  </td>
                  <td className="px-4 py-3">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="h-10 w-14 object-cover rounded-lg" />
                    ) : (
                      <div className="h-10 w-14 rounded-lg bg-secondary flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.icon} {c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.sort_order}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "No categories match your search" : "No categories"}
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
        title="Delete category?"
        description="This will remove the category. Services within it won't be deleted."
      />
      <ConfirmDeleteDialog
        open={confirmBulkDelete}
        onOpenChange={(open) => !open && setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
        loading={bulkLoading}
        title={`Delete ${selected.size} categor${selected.size > 1 ? "ies" : "y"}?`}
        description="This will permanently delete the selected categories."
      />
    </div>
  );
}
