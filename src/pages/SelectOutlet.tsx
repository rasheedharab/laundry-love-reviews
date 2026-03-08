import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Clock, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MapPlaceholder from "@/components/MapPlaceholder";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Outlet {
  id: string;
  name: string;
  address_line: string;
  city: string | null;
  postal_code: string | null;
  operating_hours: any;
}

export default function SelectOutlet() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("outlets")
      .select("id, name, address_line, city, postal_code, operating_hours")
      .eq("is_active", true)
      .then(({ data }) => {
        setOutlets(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = outlets.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.address_line.toLowerCase().includes(search.toLowerCase())
  );

  const formatAddress = (o: Outlet) => {
    const parts = [o.address_line, o.city, o.postal_code].filter(Boolean);
    return parts.join(", ");
  };

  const formatHours = (hours: any) => {
    if (!hours?.closing) return "Hours not available";
    return `Open until ${hours.closing}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Select Outlet</h1>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative rounded-2xl border border-border bg-card">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Find a location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-11 h-12 rounded-2xl border-0 focus-visible:ring-0"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <Navigation className="h-4 w-4 text-accent" />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="px-5 mb-4">
        <MapPlaceholder height="h-64" label="Find nearby outlets" />
      </div>

      {/* Boutiques List */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Available Boutiques</p>
            <p className="text-xs text-muted-foreground">{loading ? "Loading..." : `${filtered.length} locations nearby`}</p>
          </div>
          <button className="text-[10px] uppercase tracking-wider font-semibold text-foreground">Filter</button>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-xl ml-auto" />
              </div>
            ))
          ) : (
            filtered.map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground">{b.name}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{formatAddress(b)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">{formatHours(b.operating_hours)}</span>
                  </div>
                  <Button
                    className="h-9 px-6 rounded-xl bg-foreground text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-foreground/90"
                    onClick={() => navigate(-1)}
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
