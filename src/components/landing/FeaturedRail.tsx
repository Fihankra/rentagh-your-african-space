import { properties } from "@/lib/mock-properties";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SectionHeading } from "./SectionHeading";

export function FeaturedRail() {
  const list = properties.filter((p) => p.featured);
  return (
    <section className="mt-24">
      <SectionHeading
        title="Featured this week"
        subtitle="Hand-selected by our team — verified, beautifully shot, and ready to move on."
        link={{ to: "/browse", label: "View all listings" }}
      />
      <div className="container-x mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <PropertyCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}