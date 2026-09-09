import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Home, MapPin, Settings, Shield } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getMyProperties, claimFirstAdmin } from "@/lib/properties.functions";
import { getOnboardingState } from "@/lib/admin.functions";
import { priceLabel, type Property } from "@/lib/property";
import { categoryLabel } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — RentaGh" },
      { name: "description", content: "Manage your properties and rentals on RentaGh." },
      { property: "og:title", content: "Dashboard — RentaGh" },
      { property: "og:description", content: "Manage your properties and rentals on RentaGh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
});

function AdminOnboarding() {
  const qc = useQueryClient();
  const { data: state } = useQuery({ queryKey: ["onboarding"], queryFn: () => getOnboardingState() });

  const claim = useMutation({
    mutationFn: () => claimFirstAdmin({}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding"] }),
  });

  if (!state) return null;

  if (state.isAdmin) {
    return (
      <section className="mt-8 rounded-[24px] border hairline bg-card p-6">
        <Shield className="h-6 w-6 text-emerald-600" />
        <h2 className="mt-3 font-display text-xl font-semibold text-foreground">You are the administrator</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You can review every listing and give administrator access to other people.
        </p>
        <Link
          to="/admin"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Open admin dashboard
        </Link>
      </section>
    );
  }

  if (state.adminExists) return null;

  return (
    <section className="mt-8 rounded-[24px] border hairline bg-card p-6">
      <Shield className="h-6 w-6 text-gold" />
      <h2 className="mt-3 font-display text-xl font-semibold text-foreground">Finish setting up RentaGh</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Nobody manages this site yet. Take the administrator spot to approve listings and add other administrators.
      </p>
      <button
        onClick={() => claim.mutate()}
        disabled={claim.isPending}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {claim.isPending ? "Setting up…" : "Become the administrator"}
      </button>
      {claim.isError && <p className="mt-2 text-sm text-red-600">Could not complete that. Please try again.</p>}
    </section>
  );
}

function DashboardPage() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: () => getMyProperties(),
  });

  return (
    <>
      <SiteHeader />
      <main className="container-x pt-28 pb-20 md:pt-32">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">Your dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage listings, enquiries and account settings.</p>
          </div>
          <Link
            to="/listings/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add listing
          </Link>
        </div>

        <AdminOnboarding />


        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[24px] border hairline bg-card p-6">
            <Home className="h-6 w-6 text-primary" />
            <p className="mt-4 text-3xl font-semibold text-foreground">{properties?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Active listings</p>
          </div>
          <div className="rounded-[24px] border hairline bg-card p-6">
            <MapPin className="h-6 w-6 text-gold" />
            <p className="mt-4 text-3xl font-semibold text-foreground">{properties?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Properties</p>
          </div>
          <div className="rounded-[24px] border hairline bg-card p-6">
            <Settings className="h-6 w-6 text-emerald-600" />
            <p className="mt-4 text-3xl font-semibold text-foreground">—</p>
            <p className="text-sm text-muted-foreground">Enquiries</p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-foreground">Your listings</h2>
          {isLoading ? (
            <div className="mt-6 rounded-[24px] border hairline bg-card p-10 text-center text-muted-foreground">
              Loading…
            </div>
          ) : !properties?.length ? (
            <div className="mt-6 rounded-[24px] border hairline bg-card p-10 text-center">
              <p className="text-muted-foreground">You have not listed any properties yet.</p>
              <Link
                to="/listings/new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add your first listing
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p: Property) => (
                <Link
                  key={p.id}
                  to="/property/$id"
                  params={{ id: p.id }}
                  className="group overflow-hidden rounded-[24px] border hairline bg-card transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                      {categoryLabel(p.category)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-medium text-foreground">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {p.neighborhood}, {p.city} · {p.area ?? "—"}
                    </p>
                    <p className="mt-2 font-semibold text-emerald-700">{priceLabel(p)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
