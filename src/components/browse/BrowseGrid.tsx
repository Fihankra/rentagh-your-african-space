import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertyCardSkeleton } from "@/components/site/PropertyCardSkeleton";
import { listProperties } from "@/lib/properties.functions";
import { categories, type CategorySlug } from "@/lib/categories";
import { formatGHS } from "@/lib/property";
import { cn } from "@/lib/utils";

const regions = [
  "All regions",
  "Greater Accra",
  "Ashanti",
  "Central",
  "Western",
  "Eastern",
  "Northern",
  "Volta",
] as const;

type Availability = "all" | "rent" | "sale";

const availabilityOptions: { value: Availability; label: string }[] = [
  { value: "all", label: "Rent & sale" },
  { value: "rent", label: "For rent" },
  { value: "sale", label: "For sale" },
];

export function BrowseGrid({ initialCategory }: { initialCategory?: CategorySlug }) {
  const [category, setCategory] = useState<CategorySlug | "all">(initialCategory ?? "all");
  const [region, setRegion] = useState<(typeof regions)[number]>("All regions");
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<Availability>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: source = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => listProperties({ data: {} }),
    staleTime: 60_000,
  });

  const min = Number(minPrice) || undefined;
  const max = Number(maxPrice) || undefined;

  const matchesQuery = (p: (typeof source)[number]) =>
    !query ||
    `${p.title} ${p.city} ${p.neighborhood} ${p.region}`
      .toLowerCase()
      .includes(query.toLowerCase());

  const matchesSecondary = (p: (typeof source)[number]) => {
    if (availability !== "all" && p.listingType !== availability) return false;
    if (min !== undefined && p.priceGHS < min) return false;
    if (max !== undefined && p.priceGHS > max) return false;
    return matchesQuery(p);
  };

  const list = useMemo(() => {
    const filtered = source.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (region !== "All regions" && p.region !== region) return false;
      return matchesSecondary(p);
    });
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.priceGHS - b.priceGHS);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.priceGHS - a.priceGHS);
    return filtered;
  }, [source, category, region, query, availability, minPrice, maxPrice, sort]);

  const perPage = 9;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = list.slice((safePage - 1) * perPage, safePage * perPage);

  // Any filter change returns to the first page of results.
  useEffect(() => {
    setPage(1);
  }, [category, region, query, availability, minPrice, maxPrice, sort]);

  const categoryCounts = useMemo(() => {
    const base = source.filter(
      (p) => (region === "All regions" || p.region === region) && matchesSecondary(p),
    );
    const counts: Record<string, number> = { all: base.length };
    for (const c of categories) counts[c.slug] = base.filter((p) => p.category === c.slug).length;
    return counts;
  }, [source, region, query, availability, minPrice, maxPrice]);

  const regionCounts = useMemo(() => {
    const base = source.filter(
      (p) => (category === "all" || p.category === category) && matchesSecondary(p),
    );
    const counts: Record<string, number> = { "All regions": base.length };
    for (const r of regions)
      if (r !== "All regions") counts[r] = base.filter((p) => p.region === r).length;
    return counts;
  }, [source, category, query, availability, minPrice, maxPrice]);

  const activeExtras =
    (availability !== "all" ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sort !== "featured" ? 1 : 0);

  function clearAll() {
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
    setRegion("All regions");
    setQuery("");
  }

  return (
    <section className="container-x pt-28 md:pt-32">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl">
            {category === "all"
              ? "All properties"
              : categories.find((c) => c.slug === category)?.label}
          </h1>
          <p className="mt-2 text-muted-foreground">{list.length} listings · across Ghana</p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Search hostels, houses, lands, cities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-full border hairline bg-card px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 md:w-80"
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 rounded-full border hairline px-4 text-sm font-medium",
              filtersOpen || activeExtras
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground/80",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeExtras ? ` (${activeExtras})` : ""}
          </button>
        </div>
      </div>

      <div className="mt-8 -mx-5 overflow-x-auto px-5">
        <div className="flex gap-2">
          <Link
            to="/browse"
            onClick={() => setCategory("all")}
            className={cn(
              "shrink-0 rounded-full border hairline px-4 py-2 text-sm transition-colors",
              category === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground/75 hover:bg-muted",
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
                category === c.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground/75 hover:bg-muted",
              )}
            >
              {c.label} <span className="opacity-70">({categoryCounts[c.slug] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 -mx-5 overflow-x-auto px-5">
        <div className="flex gap-2">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                region === r
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground/70 hover:bg-muted/70",
              )}
            >
              {r} <span className="opacity-70">({regionCounts[r] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-5 rounded-3xl border hairline bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg text-foreground">Refine your search</div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Availability
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {availabilityOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setAvailability(o.value)}
                    className={cn(
                      "rounded-full border hairline px-3.5 py-2 text-xs font-medium",
                      availability === o.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "bg-background text-foreground/75",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Price range (GHS)
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Min"
                  className="h-11 w-full rounded-2xl border hairline bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Max"
                  className="h-11 w-full rounded-2xl border hairline bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {(min !== undefined || max !== undefined) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {min !== undefined ? formatGHS(min) : "Any"} –{" "}
                  {max !== undefined ? formatGHS(max) : "Any"}
                </p>
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Sort by
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="mt-2 h-11 w-full rounded-2xl border hairline bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="featured">Featured first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t hairline pt-4">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Show {list.length} listings
            </button>
          </div>
        </div>
      )}

      {isLoading && list.length === 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            type="button"
            onClick={() => setPage((n) => Math.max(1, n - 1))}
            disabled={safePage === 1}
            className="rounded-full border hairline bg-card px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === safePage ? "page" : undefined}
              className={cn(
                "min-w-10 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors",
                n === safePage
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground/70 hover:bg-muted/70",
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
            disabled={safePage === totalPages}
            className="rounded-full border hairline bg-card px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}

      {!isLoading && list.length === 0 && (
        <div className="mt-16 rounded-3xl border hairline bg-card p-12 text-center">
          <div className="font-display text-2xl text-foreground">
            No listings match your filters
          </div>
          <p className="mt-2 text-muted-foreground">
            Try a wider price range, another region, or clear your search.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 rounded-full border hairline bg-background px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Clear all filters
          </button>
        </div>
      )}
    </section>
  );
}
