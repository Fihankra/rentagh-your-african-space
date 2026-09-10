import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { adminListProperties } from "@/lib/properties.functions";
import { PropertiesTable } from "@/components/admin/PropertiesTable";

export const Route = createFileRoute("/_authenticated/admin/listings")({
  component: AdminListings,
  head: () => ({
    meta: [{ title: "Listings | RentaGh Admin" }],
  }),
});

function AdminListings() {
  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => adminListProperties(),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          Listings
        </h1>
        <Link
          to="/listings/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add listing
        </Link>
      </div>
      <div className="mt-6">
        <PropertiesTable properties={properties ?? []} emptyLabel="No listings yet." />
      </div>
    </div>
  );
}
