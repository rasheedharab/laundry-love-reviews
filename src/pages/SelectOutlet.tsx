import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Clock, Navigation } from "lucide-react";
import MapPlaceholder from "@/components/MapPlaceholder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const boutiques = [
  { id: "1", name: "White Rabbit — Bandra", address: "14th Road, Bandra West, Mumbai 400050", distance: "1.2 km", hours: "9 AM – 8 PM" },
  { id: "2", name: "White Rabbit — Juhu", address: "Juhu Tara Road, Juhu, Mumbai 400049", distance: "3.4 km", hours: "9 AM – 8 PM" },
  { id: "3", name: "White Rabbit — Powai", address: "Hiranandani Gardens, Powai, Mumbai 400076", distance: "8.1 km", hours: "10 AM – 7 PM" },
  { id: "4", name: "White Rabbit — South Mumbai", address: "Colaba Causeway, Mumbai 400005", distance: "12.5 km", hours: "10 AM – 9 PM" },
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
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">Select Outlet</h1>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-2xl border-border"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <Navigation className="h-4 w-4 text-accent" />
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mx-5 mb-5">
        <MapPlaceholder height="h-40" label="Find nearby outlets" />
      </div>

      {/* Boutiques List */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">AVAILABLE BOUTIQUES · {filtered.length}</p>
          <button className="text-[10px] uppercase tracking-wider font-semibold text-accent">Filter</button>
        </div>

        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{b.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{b.address}</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-accent" />
                  <span className="text-xs font-medium text-accent">{b.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{b.hours}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full h-9 rounded-xl text-xs font-semibold uppercase tracking-wider"
                onClick={() => navigate(-1)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
