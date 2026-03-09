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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import BulkActionBar from "@/components/admin/BulkActionBar";

interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number | null;
  is_active: boolean | null;
}

const emptyForm = { question: "", answer: "", sort_order: "0", is_active: true };

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    setFaqs((data as Faq[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = faqs.filter((f) =>
    !search.trim() || f.question.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };

  const openEdit = (f: Faq) => {
    setForm({
      question: f.question,
      answer: f.answer,
      sort_order: String(f.sort_order ?? 0),
      is_active: f.is_active ?? true,
    });
    setEditId(f.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) { toast.error("Question and answer required"); return; }
    const payload = {
      question: form.question,
      answer: form.answer,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    };
    if (editId) {
      const { error } = await supabase.from("faqs").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("FAQ updated");
    } else {
      const { error } = await supabase.from("faqs").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("FAQ created");
    }
    setOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from("faqs").delete().eq("id", deleteId);
    setDeleting(false);
    toast.success("FAQ deleted");
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
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((f) => f.id)));
  };

  const bulkSetActive = async (value: boolean) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("faqs").update({ is_active: value }).in("id", Array.from(selected));
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} FAQ${selected.size > 1 ? "s" : ""} ${value ? "activated" : "deactivated"}`);
    setSelected(new Set());
    fetchData();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("faqs").delete().in("id", Array.from(selected));
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} FAQ${selected.size > 1 ? "s" : ""} deleted`);
    setSelected(new Set());
    setConfirmBulkDelete(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FAQs</h1>
          <p className="text-sm text-muted-foreground">Manage frequently asked questions shown on the support page</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search questions…"
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

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Question</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((faq) => (
              <tr
                key={faq.id}
                className={`border-t border-border hover:bg-muted/30 ${selected.has(faq.id) ? "bg-primary/5" : ""}`}
              >
                <td className="px-4 py-3">
                  <Checkbox checked={selected.has(faq.id)} onCheckedChange={() => toggleSelect(faq.id)} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{faq.sort_order}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{faq.question}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{faq.answer}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${faq.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {faq.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(faq)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(faq.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? "No FAQs match your search" : "No FAQs yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
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
        loading={deleting}
        title="Delete FAQ?"
        description="This will permanently remove this FAQ from the support page."
      />
      <ConfirmDeleteDialog
        open={confirmBulkDelete}
        onOpenChange={(open) => !open && setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
        loading={bulkLoading}
        title={`Delete ${selected.size} FAQ${selected.size > 1 ? "s" : ""}?`}
        description="This will permanently delete the selected FAQs."
      />
    </div>
  );
}
