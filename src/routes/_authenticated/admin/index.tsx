import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Users, Shield } from "lucide-react";
import { adminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
  head: () => ({
    meta: [{ title: "Overview | RentaGh Admin" }],
  }),
});

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-[20px] border hairline bg-card p-5">
      {icon}
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function AdminOverview() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => adminStats() });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Overview</h1>

      {stats ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<LayoutGrid className="h-5 w-5 text-primary" />}
            label="Listings"
            value={stats.properties}
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-gold" />}
            label="Users"
            value={stats.users}
          />
          <StatCard
            icon={<Shield className="h-5 w-5 text-emerald-600" />}
            label="Admins"
            value={stats.admins}
          />
          <div className="rounded-[20px] border hairline bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              By category
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {stats.byCategory.map((row: any) => (
                <li key={row.category} className="flex justify-between">
                  <span className="capitalize text-foreground/80">{row.category}</span>
                  <span className="font-medium text-foreground">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
