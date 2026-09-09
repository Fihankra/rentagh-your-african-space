import { useQuery } from "@tanstack/react-query";
import { PropertyCard } from "@/components/site/PropertyCard";
import { listProperties } from "@/lib/properties.functions";
import { SectionHeading } from "./SectionHeading";

export function FeaturedRail() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => listProperties({ data: {} }),
    staleTime: 60_000,
  });

  const featured = data.filter((p) => p.featured);
  const list = (featured.length ? featured : data).slice(0, 3);

  if (!isLoading && list.length === 0) return null;

  return (
    <section className="mt-24">
      <SectionHeading
        title="Featured this week"
        subtitle="Student hostels, houses for rent, building and farm lands — verified and ready."
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
