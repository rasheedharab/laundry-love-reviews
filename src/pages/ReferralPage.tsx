import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Copy, Share2, Users, Gift, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimation";
import AnimatedPage from "@/components/AnimatedPage";
import { toast } from "sonner";

interface Referral {
  id: string;
  referral_code: string;
  referred_user_id: string | null;
  status: string;
  reward_points: number | null;
  created_at: string;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [myCode, setMyCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      const refs = (data as Referral[]) || [];
      setReferrals(refs);

      if (refs.length > 0) {
        setMyCode(refs[0].referral_code);
      } else {
        // Generate a new code
        const code = `WR-${user.id.slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        await supabase.from("referrals").insert({ referrer_id: user.id, referral_code: code } as any);
        setMyCode(code);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const copyCode = () => {
    if (myCode) {
      navigator.clipboard.writeText(myCode);
      toast.success("Referral code copied!");
    }
  };

  const shareCode = () => {
    if (myCode && navigator.share) {
      navigator.share({
        title: "White Rabbit Premium Laundry",
        text: `Use my referral code ${myCode} to get a reward when you sign up at White Rabbit!`,
      });
    } else {
      copyCode();
    }
  };

  const completedReferrals = referrals.filter((r) => r.status === "completed");

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">Refer a Friend</h1>
        </div>

        {/* Hero Card */}
        <div className="rounded-2xl bg-gradient-to-br from-accent to-primary p-6 text-accent-foreground mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-foreground/20">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-display font-bold">Earn 100 Points</p>
              <p className="text-xs opacity-80">For each friend who joins</p>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-14 rounded-xl bg-accent-foreground/10" />
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-accent-foreground/15 p-3 mb-3">
                <p className="flex-1 text-center font-mono text-lg font-bold tracking-widest">{myCode}</p>
                <button onClick={copyCode} className="p-2 rounded-lg hover:bg-accent-foreground/10">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <Button
                onClick={shareCode}
                className="w-full h-11 rounded-xl bg-accent-foreground text-accent text-sm font-semibold"
              >
                <Share2 className="h-4 w-4 mr-2" /> Share with Friends
              </Button>
            </>
          )}
        </div>

        {/* How it works */}
        <div className="mb-6">
          <p className="section-label mb-3">HOW IT WORKS</p>
          <div className="space-y-3">
            {[
              { step: "1", title: "Share your code", desc: "Send your unique referral code to friends" },
              { step: "2", title: "Friend signs up", desc: "They create an account using your code" },
              { step: "3", title: "Both earn rewards", desc: "You get 100 points, they get 50 points" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <span className="text-xs font-bold text-accent">{item.step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Referrals</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{completedReferrals.length}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Referral History */}
        {referrals.length > 1 && (
          <div>
            <p className="section-label mb-3">REFERRAL HISTORY</p>
            <StaggerContainer className="space-y-2">
              {referrals.slice(1).map((ref) => (
                <StaggerItem key={ref.id}>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      ref.status === "completed" ? "bg-accent/10" : "bg-secondary"
                    }`}>
                      {ref.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      ) : (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground capitalize">{ref.status}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    {ref.status === "completed" && (
                      <span className="text-xs font-bold text-accent">+{ref.reward_points} pts</span>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
