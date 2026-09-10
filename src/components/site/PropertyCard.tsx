import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, MapPin, BadgeCheck, Star } from "lucide-react";
import { priceLabel, type Property } from "@/lib/mock-properties";
import { categoryLabel } from "@/lib/categories";

export function PropertyCard({ p, eager = false }: { p: Property; eager?: boolean }) {
  return (
    <Link
      to="/property/$id"
      params={{ id: p.id }}
      className="group block overflow-hidden rounded-3xl bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={p.cover}
          alt={p.title}
          loading={eager ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/80 backdrop-blur">
              {categoryLabel(p.category)}
            </span>
            {p.verified && (
              <span className="flex items-center gap-1 rounded-full bg-primary/95 px-3 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          {p.featured && (
            <span className="shrink-0 rounded-full bg-[color:var(--accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--charcoal)]">
              Featured
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">{p.title}</h3>
          {p.reviews > 0 && (
            <div className="flex shrink-0 items-center gap-1 text-sm text-foreground/70">
              <Star className="h-3.5 w-3.5 fill-[color:var(--accent)] text-[color:var(--accent)]" />
              {p.rating}
            </div>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {p.neighborhood}, {p.city}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-foreground">
            <span className="font-display text-xl font-semibold">{priceLabel(p)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {p.beds !== undefined && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                {p.beds}
              </span>
            )}
            {p.baths !== undefined && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {p.baths}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
