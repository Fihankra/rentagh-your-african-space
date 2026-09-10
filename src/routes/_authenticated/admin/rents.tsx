import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminListProperties } from "@/lib/properties.functions";
import { PropertiesTable } from "@/components/admin/PropertiesTable";

export const Route = createFileRoute("/_authenticated/admin/rents")({
  component: AdminRents,
  head: () => ({
    meta: [{ title: "Rents | RentaGh Admin" }],
  }),
});

function AdminRents() {
  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => adminListProperties(),
  });
  const rents = (properties ?? []).filter((p) => p.listingType === "rent");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
        Current Rents
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Listings marked for rent, across every category.
      </p>
      <div className="mt-6">
        <PropertiesTable properties={rents} emptyLabel="No rental listings yet." />
      </div>
    </div>
  );
}
