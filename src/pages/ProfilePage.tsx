import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MapPin, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import type { Tables } from "@/integrations/supabase/types";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    toast.success("Signed out");
  };

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <img src={logoImg} alt="White Rabbit" className="mb-6 h-16 opacity-30" />
        <p className="mb-4 text-muted-foreground">Sign in to view your profile</p>
        <Button onClick={() => navigate("/login")} className="rounded-xl">Sign In</Button>
      </div>
    );
  }

  const menuItems = [
    { icon: User, label: "Edit Profile", action: () => {} },
    { icon: MapPin, label: "Saved Addresses", action: () => {} },
    { icon: Mail, label: user.email || "", action: () => {} },
  ];

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="mb-6 text-2xl font-display font-bold text-foreground">Profile</h1>

      {/* Avatar + Name */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">{profile?.full_name || "User"}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          {profile?.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-6">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-sm"
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <Button variant="outline" onClick={handleSignOut} className="w-full h-11 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5">
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>

      <div className="mt-8 flex justify-center">
        <img src={logoImg} alt="White Rabbit" className="h-10 opacity-15" />
      </div>
    </div>
  );
}
