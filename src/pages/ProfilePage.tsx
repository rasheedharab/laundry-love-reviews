import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, CreditCard, ClipboardList, Gift, Headphones, LogOut, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <Button onClick={() => navigate("/login")} className="rounded-2xl">Sign In</Button>
      </div>
    );
  }

  const menuItems = [
    { icon: MapPin, label: "Saved Addresses", action: () => navigate("/saved-addresses") },
    { icon: CreditCard, label: "Payment Methods", action: () => {} },
    { icon: ClipboardList, label: "Order History", action: () => navigate("/orders") },
    { icon: Gift, label: "Refer a Friend", action: () => {} },
    { icon: Headphones, label: "Support & Concierge", action: () => {} },
  ];

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Avatar + Name */}
      <button onClick={() => navigate("/edit-profile")} className="mb-5 flex flex-col items-center w-full">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-3">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-lg font-display font-bold text-foreground">{profile?.full_name || "User"}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        <p className="text-[10px] text-accent mt-1 font-medium">Tap to edit profile</p>
      </button>

      {/* Premium Club Card */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-accent to-primary p-5 text-accent-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-80">WHITE RABBIT</p>
            <p className="text-sm font-display font-bold">PREMIUM CLUB</p>
          </div>
          <Badge className="bg-accent-foreground/20 text-accent-foreground border-0 text-[9px] uppercase tracking-wider">
            Active
          </Badge>
        </div>
        <p className="text-xs font-mono opacity-70">•••• •••• •••• {user.id.slice(-4).toUpperCase()}</p>
      </div>

      {/* Menu Items */}
      <div className="space-y-2 mb-6">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Membership */}
      <button
        onClick={() => navigate("/membership")}
        className="mb-4 flex w-full items-center gap-3.5 rounded-2xl border border-accent/20 bg-accent/5 p-4 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <Gift className="h-4 w-4 text-accent" />
        </div>
        <span className="flex-1 text-sm font-medium text-accent">White Rabbit Club</span>
        <ChevronRight className="h-4 w-4 text-accent" />
      </button>

      <Button variant="outline" onClick={handleSignOut} className="w-full h-11 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5">
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>

      <div className="mt-8 flex justify-center">
        <img src={logoImg} alt="White Rabbit" className="h-10 opacity-15" />
      </div>
    </div>
  );
}
