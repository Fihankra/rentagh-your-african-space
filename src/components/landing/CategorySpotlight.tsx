import { properties } from "@/lib/mock-properties";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SectionHeading } from "./SectionHeading";
import type { CategorySlug } from "@/lib/categories";

export function CategorySpotlight({
  category, eyebrow, title, subtitle,
}: { category: CategorySlug; eyebrow: string; title: string; subtitle: string }) {
  const list = properties.filter((p) => p.category === category).slice(0, 3);
  if (list.length === 0) return null;
  return (
    <section className="mt-24">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        link={{ to: "/browse/$category", label: "Browse all", params: { category } }}
      />
      <div className="container-x mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}