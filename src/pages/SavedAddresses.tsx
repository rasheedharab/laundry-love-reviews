import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimation";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/EmptyState";
import type { Tables } from "@/integrations/supabase/types";

export default function SavedAddresses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Tables<"addresses">[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAddr, setEditAddr] = useState<Tables<"addresses"> | null>(null);
  const [form, setForm] = useState({ label: "Home", address_line: "", city: "", postal_code: "" });

  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at");
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  const openAdd = () => {
    setEditAddr(null);
    setForm({ label: "Home", address_line: "", city: "", postal_code: "" });
    setDialogOpen(true);
  };

  const openEdit = (addr: Tables<"addresses">) => {
    setEditAddr(addr);
    setForm({ label: addr.label, address_line: addr.address_line, city: addr.city || "", postal_code: addr.postal_code || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.address_line.trim()) { toast.error("Address is required"); return; }

    if (editAddr) {
      const { error } = await supabase.from("addresses").update({
        label: form.label, address_line: form.address_line, city: form.city || null, postal_code: form.postal_code || null,
      }).eq("id", editAddr.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Address updated");
    } else {
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id, label: form.label, address_line: form.address_line, city: form.city || null, postal_code: form.postal_code || null,
      });
      if (error) { toast.error("Failed to save"); return; }
      toast.success("Address added");
    }
    setDialogOpen(false);
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    toast.success("Address removed");
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    toast.success("Default address set");
    fetchAddresses();
  };

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">Saved Addresses</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : addresses.length === 0 ? (
          <EmptyState variant="addresses" title="No saved addresses" description="Add your first address for quick checkout" />
        ) : (
          <StaggerContainer className="space-y-3">
            {addresses.map((addr) => (
              <StaggerItem key={addr.id}>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{addr.label}</span>
                      {addr.is_default && (
                        <span className="text-[8px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">Default</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!addr.is_default && (
                        <button onClick={() => handleSetDefault(addr.id)} className="p-1.5 rounded-lg hover:bg-secondary">
                          <Star className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => openEdit(addr)} className="text-left w-full">
                    <p className="text-sm text-foreground">{addr.address_line}</p>
                    {(addr.city || addr.postal_code) && (
                      <p className="text-xs text-muted-foreground mt-0.5">{[addr.city, addr.postal_code].filter(Boolean).join(", ")}</p>
                    )}
                  </button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <Button onClick={openAdd} className="w-full mt-5 h-11 rounded-2xl bg-foreground text-primary-foreground hover:bg-foreground/90">
          <Plus className="h-4 w-4 mr-2" /> Add Address
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">{editAddr ? "Edit Address" : "New Address"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <label className="section-label mb-1 block">Label</label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setForm({ ...form, label: l })}
                      className={`flex-1 rounded-xl border-2 py-2 text-xs font-semibold transition-all ${
                        form.label === l ? "border-foreground bg-foreground text-primary-foreground" : "border-border text-foreground"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="section-label mb-1 block">Address</label>
                <Input value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} placeholder="Full address" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="section-label mb-1 block">City</label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-xl" />
                </div>
                <div>
                  <label className="section-label mb-1 block">Postal Code</label>
                  <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="PIN" className="rounded-xl" />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full h-11 rounded-2xl bg-foreground text-primary-foreground">
                {editAddr ? "Update" : "Save"} Address
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
