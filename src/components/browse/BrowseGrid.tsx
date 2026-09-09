import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PropertyCard } from "@/components/site/PropertyCard";
import { properties } from "@/lib/mock-properties";
import { categories, type CategorySlug } from "@/lib/categories";
import { cn } from "@/lib/utils";

const regions = ["All regions", "Greater Accra", "Ashanti", "Central", "Western", "Eastern"] as const;

export function BrowseGrid({ initialCategory }: { initialCategory?: CategorySlug }) {
  const [category, setCategory] = useState<CategorySlug | "all">(initialCategory ?? "all");
  const [region, setRegion] = useState<(typeof regions)[number]>("All regions");
  const [query, setQuery] = useState("");

  const matchesQuery = (p: (typeof properties)[number]) =>
    !query || `${p.title} ${p.city} ${p.neighborhood}`.toLowerCase().includes(query.toLowerCase());

  const list = useMemo(() => {
    return properties.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (region !== "All regions" && p.region !== region) return false;
      return matchesQuery(p);
    });
  }, [category, region, query]);

  // Counts shown on each facet reflect the other active filters, so the number
  // on a chip always equals the results you get after clicking it.
  const categoryCounts = useMemo(() => {
    const base = properties.filter((p) => (region === "All regions" || p.region === region) && matchesQuery(p));
    const counts: Record<string, number> = { all: base.length };
    for (const c of categories) counts[c.slug] = base.filter((p) => p.category === c.slug).length;
    return counts;
  }, [region, query]);

  const regionCounts = useMemo(() => {
    const base = properties.filter((p) => (category === "all" || p.category === category) && matchesQuery(p));
    const counts: Record<string, number> = { "All regions": base.length };
    for (const r of regions) if (r !== "All regions") counts[r] = base.filter((p) => p.region === r).length;
    return counts;
  }, [category, query]);

  return (
    <section className="container-x pt-28 md:pt-32">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl">
            {category === "all" ? "All properties" : categories.find((c) => c.slug === category)?.label}
          </h1>
          <p className="mt-2 text-muted-foreground">{list.length} listings · across Ghana</p>
        </div>
        <input
          placeholder="Search hostels, houses, lands, cities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 w-full rounded-full border hairline bg-card px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 md:w-80"
        />
      </div>

      {/* Filter chips */}
      <div className="mt-8 -mx-5 overflow-x-auto px-5">
        <div className="flex gap-2">
          <Link
            to="/browse"
            onClick={() => setCategory("all")}
            className={cn(
              "shrink-0 rounded-full border hairline px-4 py-2 text-sm transition-colors",
              category === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground/75 hover:bg-muted"
            )}
          >
            All <span className="opacity-70">({categoryCounts["all"] ?? 0})</span>
          </Link>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "shrink-0 rounded-full border hairline px-4 py-2 text-sm transition-colors",
                category === c.slug ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground/75 hover:bg-muted"
              )}
            >
              {c.label} <span className="opacity-70">({categoryCounts[c.slug] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              region === r ? "bg-foreground text-background" : "bg-muted text-foreground/70 hover:bg-muted/70"
            )}
          >
            {r} <span className="opacity-70">({regionCounts[r] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>

      {list.length === 0 && (
        <div className="mt-16 rounded-3xl border hairline bg-card p-12 text-center">
          <div className="font-display text-2xl text-foreground">No listings match your filters</div>
          <p className="mt-2 text-muted-foreground">Try a different region or clear your search.</p>
        </div>
      )}
    </section>
  );
}