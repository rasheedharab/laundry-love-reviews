import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data);
        setForm({ full_name: data.full_name || "", phone: data.phone || "" });
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name.trim() || null,
      phone: form.phone.trim() || null,
    }).eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      navigate(-1);
    }
    setSaving(false);
  };

  if (!user) { navigate("/login"); return null; }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-lg font-display font-bold text-foreground">Edit Profile</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="section-label mb-2 block">Full Name</label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your full name"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="section-label mb-2 block">Email</label>
              <Input
                value={user.email || ""}
                disabled
                className="rounded-xl bg-muted"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="section-label mb-2 block">Phone Number</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-8 h-12 rounded-2xl bg-foreground text-primary-foreground hover:bg-foreground/90 text-sm font-semibold uppercase tracking-wider"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </>
      )}
    </div>
  );
}
