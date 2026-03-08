import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, CreditCard, ClipboardList, Gift, Headphones, LogOut, ChevronRight, Settings, Star, Sun, Moon, Monitor, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import logoImg from "@/assets/logo.png";
import type { Tables } from "@/integrations/supabase/types";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
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
      <AnimatedPage>
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <img src={logoImg} alt="White Rabbit" className="mb-6 h-16 opacity-30" />
          <p className="mb-4 text-muted-foreground">Sign in to view your profile</p>
          <Button onClick={() => navigate("/login")} className="rounded-2xl">Sign In</Button>
        </div>
      </AnimatedPage>
    );
  }

  const themeOptions: { value: "light" | "dark" | "system"; icon: React.ElementType; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "Auto" },
  ];

  const menuItems = [
    { icon: MapPin, label: "Saved Addresses", action: () => navigate("/saved-addresses") },
    { icon: CreditCard, label: "Payment Methods", action: () => {} },
    { icon: ClipboardList, label: "Order History", action: () => navigate("/orders") },
    { icon: Gift, label: "Refer a Friend", action: () => navigate("/referral") },
    { icon: Headphones, label: "Support & Concierge", action: () => {} },
  ];

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
          <button onClick={() => navigate("/edit-profile")} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary/80 border-4 border-background shadow-lg mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-muted-foreground/50" />
            )}
          </div>
          <p className="text-xl font-display font-bold text-foreground">{profile?.full_name || "User"}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Mumbai, India</p>
        </div>

        {/* Premium Club Card */}
        <div className="mb-6 rounded-2xl glass-accent p-5 text-accent-foreground relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Star className="h-8 w-8 text-accent-foreground/20" />
          </div>
          <p className="text-sm font-bold tracking-wider">WHITE RABBIT</p>
          <p className="text-xs opacity-80 mb-4">PREMIUM CLUB</p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-70">•••• •••• •••• {user.id.slice(-4).toUpperCase()}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-foreground/20 px-2 py-0.5 rounded-full">Active</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {menuItems.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex w-full items-center gap-4 rounded-2xl glass p-4 text-left transition-colors hover:bg-secondary/50"
            >
              <Icon className="h-5 w-5 text-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="mb-6">
          <p className="section-label mb-3">APPEARANCE</p>
          <div className="flex gap-2 rounded-2xl glass p-1.5">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  theme === value
                    ? "bg-foreground text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={handleSignOut} className="w-full h-11 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5">
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </AnimatedPage>
  );
}
