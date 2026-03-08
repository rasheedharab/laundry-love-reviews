import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

const emptyForm = { key: "", value: "" };

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("site_settings").select("*").order("key");
    setSettings((data as SiteSetting[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };

  const openEdit = (s: SiteSetting) => {
    setForm({
      key: s.key,
      value: typeof s.value === "string" ? s.value : JSON.stringify(s.value, null, 2),
    });
    setEditId(s.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.key.trim()) { toast.error("Key is required"); return; }

    let parsedValue: any;
    try {
      parsedValue = JSON.parse(form.value);
    } catch {
      parsedValue = form.value;
    }

    if (editId) {
      const { error } = await supabase.from("site_settings").update({ value: parsedValue, updated_at: new Date().toISOString() }).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Setting updated");
    } else {
      const { error } = await supabase.from("site_settings").insert({ key: form.key, value: parsedValue });
      if (error) { toast.error(error.message); return; }
      toast.success("Setting created");
    }
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this setting?")) return;
    await supabase.from("site_settings").delete().eq("id", id);
    toast.success("Setting deleted");
    fetchData();
  };

  const formatValue = (val: any): string => {
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return `[${val.length} items]`;
    if (typeof val === "object") return JSON.stringify(val).slice(0, 60) + "…";
    return String(val);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground">Global configuration: contact info, time slots, and more</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Setting
        </Button>
      </div>

      <div className="space-y-4">
        {settings.map((s) => (
          <div key={s.id} className="rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm font-semibold text-foreground">{s.key}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <pre className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {typeof s.value === "string" ? s.value : JSON.stringify(s.value, null, 2)}
            </pre>
          </div>
        ))}
        {settings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No site settings configured</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Setting" : "Add Setting"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Key</Label>
              <Input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="e.g. contact_options"
                disabled={!!editId}
                className="font-mono"
              />
            </div>
            <div>
              <Label>Value (JSON or plain text)</Label>
              <Textarea
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                rows={10}
                className="font-mono text-xs"
                placeholder='e.g. ["item1", "item2"] or plain text'
              />
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
