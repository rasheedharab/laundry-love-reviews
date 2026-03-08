import { MapPin } from "lucide-react";

interface MapPlaceholderProps {
  height?: string;
  label?: string;
  className?: string;
}

export default function MapPlaceholder({ height = "h-44", label = "Map view", className = "" }: MapPlaceholderProps) {
  return (
    <div className={`${height} rounded-2xl bg-secondary relative overflow-hidden ${className}`}>
      {/* Grid pattern to simulate map */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Google Maps — coming soon</p>
        </div>
      </div>
    </div>
  );
}
