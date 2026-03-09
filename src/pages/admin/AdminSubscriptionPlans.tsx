import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import BulkActionBar from "@/components/admin/BulkActionBar";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

type Plan = Tables<"subscription_plans">;

const emptyCycles = ["monthly", "quarterly", "yearly"] as const;

interface FormState {
  name: string;
  billing_cycle: string;
  price: string;
  original_price: string;
  kg_limit: string;
  features: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: string;
  starts_at: Date | undefined;
}

const defaultForm: FormState = {
  name: "",
  billing_cycle: "monthly",
  price: "",
  original_price: "",
  kg_limit: "",
  features: "",
  is_popular: false,
  is_active: true,
  sort_order: "0",
  starts_at: undefined,
};

function planToForm(p: Plan): FormState {
  return {
    name: p.name,
    billing_cycle: p.billing_cycle,
    price: String(p.price),
    original_price: p.original_price ? String(p.original_price) : "",
    kg_limit: p.kg_limit ? String(p.kg_limit) : "",
    features: Array.isArray(p.features) ? (p.features as string[]).join("\n") : "",
    is_popular: p.is_popular ?? false,
    is_active: p.is_active ?? true,
    sort_order: String(p.sort_order ?? 0),
    starts_at: (p as any).starts_at ? new Date((p as any).starts_at) : undefined,
  };
}

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = async () => {
    const { data } = await supabase.from("subscription_plans").select("*").order("sort_order");
    setPlans(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditPlan(null);
    setCreating(true);
  };

  const openEdit = (p: Plan) => {
    setForm(planToForm(p));
    setEditPlan(p);
    setCreating(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
    setSaving(true);
    const payload: any = {
      name: form.name,
      billing_cycle: form.billing_cycle,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      kg_limit: form.kg_limit ? Number(form.kg_limit) : null,
      features: form.features.split("\n").map(f => f.trim()).filter(Boolean),
      is_popular: form.is_popular,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
      starts_at: form.starts_at ? form.starts_at.toISOString() : null,
    };

    let error;
    if (editPlan) {
      ({ error } = await supabase.from("subscription_plans").update(payload).eq("id", editPlan.id));
    } else {
      ({ error } = await supabase.from("subscription_plans").insert(payload));
    }

    if (error) { toast.error(error.message); } else {
      toast.success(editPlan ? "Plan updated" : "Plan created");
      setCreating(false);
      fetchPlans();
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("subscription_plans").delete().eq("id", deleteTarget);
    if (error) toast.error(error.message);
    else { toast.success("Plan deleted"); fetchPlans(); }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selected);
    setDeleting(true);
    const { error } = await supabase.from("subscription_plans").delete().in("id", ids);
    if (error) toast.error(error.message);
    else { toast.success(`${ids.length} plan(s) deleted`); setSelected(new Set()); fetchPlans(); }
    setDeleting(false);
    setBulkDeleting(false);
  };

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground">{plans.length} plans</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Plan
        </Button>
      </div>

      {selected.size > 0 && (
        <BulkActionBar selectedCount={selected.size} onClear={() => setSelected(new Set())} onDelete={() => setBulkDeleting(true)} />
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {plans.map(p => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-4 bg-card">
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="accent-accent" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <Badge variant="secondary" className="text-[9px] capitalize">{p.billing_cycle}</Badge>
                  {p.is_popular && <Badge className="bg-accent text-accent-foreground border-0 text-[9px]">Popular</Badge>}
                  {!p.is_active && <Badge variant="outline" className="text-[9px] text-destructive border-destructive/30">Inactive</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">₹{p.price}{p.kg_limit ? ` · ${p.kg_limit} kg` : ""}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}

      {/* Single delete confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="Delete subscription plan?"
        description="This will permanently delete this plan. Users currently on this plan won't be affected."
        loading={deleting}
      />

      {/* Bulk delete confirmation */}
      <ConfirmDeleteDialog
        open={bulkDeleting}
        onOpenChange={setBulkDeleting}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selected.size} plan(s)?`}
        description="This will permanently delete the selected plans."
        loading={deleting}
      />

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editPlan ? "Edit Plan" : "New Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Plan name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select value={form.billing_cycle} onValueChange={v => setForm(f => ({ ...f, billing_cycle: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {emptyCycles.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              <Input type="number" placeholder="Original price" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="KG limit" value={form.kg_limit} onChange={e => setForm(f => ({ ...f, kg_limit: e.target.value }))} />
              <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </div>

            {/* Start date picker */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Start Date (optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !form.starts_at && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.starts_at ? format(form.starts_at, "PPP") : "Pick a start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.starts_at}
                    onSelect={d => setForm(f => ({ ...f, starts_at: d }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {form.starts_at && (
                <button onClick={() => setForm(f => ({ ...f, starts_at: undefined }))} className="text-xs text-muted-foreground hover:text-foreground mt-1">
                  Clear date
                </button>
              )}
            </div>

            <textarea
              placeholder="Features (one per line)"
              value={form.features}
              onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.is_popular} onCheckedChange={v => setForm(f => ({ ...f, is_popular: v }))} /> Popular
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /> Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving…" : editPlan ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
