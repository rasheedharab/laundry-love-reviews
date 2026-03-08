import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Bell, CheckCheck, Gift, ShoppingBag, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimation";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/EmptyState";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const typeIcons: Record<string, React.ElementType> = {
  reward: Gift,
  order: ShoppingBag,
  review: Star,
  info: Info,
};

const typeColors: Record<string, string> = {
  reward: "bg-accent/10 text-accent",
  order: "bg-primary/10 text-primary",
  review: "bg-gold/10 text-gold",
  info: "bg-secondary text-muted-foreground",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications, user]);

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true } as any)
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleTap = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true } as any).eq("id", n.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
    }
    if (n.link) navigate(n.link);
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </button>
            <h1 className="text-lg font-display font-bold text-foreground">Notifications</h1>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-primary h-8">
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState variant="orders" title="No notifications yet" description="We'll keep you updated on your orders and rewards" />
        ) : (
          <StaggerContainer className="space-y-2">
            {notifications.map((n) => {
              const Icon = typeIcons[n.type] || Bell;
              const colorClass = typeColors[n.type] || typeColors.info;
              return (
                <StaggerItem key={n.id}>
                  <button
                    onClick={() => handleTap(n)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      n.is_read ? "border-border bg-card" : "border-accent/20 bg-accent/5"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${n.is_read ? "text-foreground" : "font-semibold text-foreground"}`}>
                          {n.title}
                        </p>
                        {!n.is_read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                      </div>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </AnimatedPage>
  );
}
