import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Clock, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MapPlaceholder from "@/components/MapPlaceholder";

const boutiques = [
  { id: "1", name: "Via Della Spiga Boutique", address: "14th Road, Bandra West, Mumbai 400050", distance: "0.8 km", hours: "Open until 20:00" },
  { id: "2", name: "Brera Atelier", address: "Juhu Tara Road, Juhu, Mumbai 400049", distance: "2.4 km", hours: "Open until 20:00" },
  { id: "3", name: "Navigli Studio", address: "Hiranandani Gardens, Powai, Mumbai 400076", distance: "4.1 km", hours: "Open until 19:00" },
];

export default function SelectOutlet() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = boutiques.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase())
  );

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
            <p className="text-xs text-muted-foreground">{filtered.length} locations nearby</p>
          </div>
          <button className="text-[10px] uppercase tracking-wider font-semibold text-foreground">Filter</button>
        </div>

        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-bold uppercase tracking-wider text-foreground">{b.name}</p>
                <span className="text-xs font-semibold text-accent">{b.distance}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{b.address}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">{b.hours}</span>
                </div>
                <Button
                  className="h-9 px-6 rounded-xl bg-foreground text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-foreground/90"
                  onClick={() => navigate(-1)}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
