import { MapPin } from "lucide-react";

export function MapPlaceholder({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border hairline bg-[color:var(--cream)]">
      <div
        className="aspect-[16/8] w-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 40%), radial-gradient(circle at 70% 70%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 45%), linear-gradient(120deg, color-mix(in oklab, var(--primary) 6%, transparent), color-mix(in oklab, var(--accent) 5%, transparent))",
          backgroundColor: "var(--cream)",
        }}
      >
        <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 800 400" preserveAspectRatio="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" x2="800" y1={i * 50} y2={i * 50} stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          ))}
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`} y1="0" y2="400" x1={i * 50} x2={i * 50} stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          ))}
          <path d="M0 220 Q200 180 400 230 T800 200" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary/40" />
          <path d="M0 280 Q220 320 460 270 T800 300" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent/50" />
        </svg>
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <span className="absolute -inset-4 animate-ping rounded-full bg-primary/30" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]">
            <MapPin className="h-5 w-5" />
          </span>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 rounded-full bg-background/95 px-4 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur">
        {label} · {lat.toFixed(3)}, {lng.toFixed(3)}
      </div>
    </div>
  );
}