import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Home, MapPin, Settings, Shield, Pencil, Trash2, Eye, Mail, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getMyProperties, claimFirstAdmin, deleteMyProperty } from "@/lib/properties.functions";
import { listMyEnquiries, updateEnquiryStatus } from "@/lib/enquiries.functions";
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

function EnquiriesInbox() {
  const qc = useQueryClient();
  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["my-enquiries"],
    queryFn: () => listMyEnquiries(),
  });

  const mark = useMutation({
    mutationFn: (vars: { id: string; status: "new" | "read" | "replied" }) => updateEnquiryStatus({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-enquiries"] }),
  });

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold text-foreground">Enquiries</h2>
      {isLoading ? (
        <div className="mt-6 rounded-[24px] border hairline bg-card p-10 text-center text-muted-foreground">Loading…</div>
      ) : !enquiries.length ? (
        <div className="mt-6 rounded-[24px] border hairline bg-card p-10 text-center text-muted-foreground">
          No one has messaged you yet. Enquiries from your property pages arrive here.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {enquiries.map((e) => (
            <li key={e.id} className="rounded-[24px] border hairline bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-foreground">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.propertyTitle} · {new Date(e.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={
                    e.status === "new"
                      ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      : "rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/70"
                  }
                >
                  {e.status === "new" ? "New" : e.status === "read" ? "Read" : "Replied"}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/80">{e.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1.5 font-medium text-primary">
                  <Mail className="h-4 w-4" /> {e.email}
                </a>
                {e.phone && (
                  <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                    <Phone className="h-4 w-4" /> {e.phone}
                  </a>
                )}
                {e.status !== "replied" && (
                  <button
                    onClick={() => mark.mutate({ id: e.id, status: e.status === "new" ? "read" : "replied" })}
                    className="rounded-full border hairline bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground"
                  >
                    {e.status === "new" ? "Mark as read" : "Mark as replied"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DashboardPage() {
  const qc = useQueryClient();
  const { data: properties, isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: () => getMyProperties(),
  });
  const { data: enquiries } = useQuery({ queryKey: ["my-enquiries"], queryFn: () => listMyEnquiries() });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMyProperty({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-properties"] }),
  });

  const published = (properties ?? []).filter((p: Property) => p.status === "published").length;

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
            <p className="mt-4 text-3xl font-semibold text-foreground">{published}</p>
            <p className="text-sm text-muted-foreground">Published listings</p>
          </div>
          <div className="rounded-[24px] border hairline bg-card p-6">
            <MapPin className="h-6 w-6 text-gold" />
            <p className="mt-4 text-3xl font-semibold text-foreground">{properties?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total properties</p>
          </div>
          <div className="rounded-[24px] border hairline bg-card p-6">
            <Settings className="h-6 w-6 text-emerald-600" />
            <p className="mt-4 text-3xl font-semibold text-foreground">{enquiries?.length ?? 0}</p>
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
                <div
                  key={p.id}
                  className="overflow-hidden rounded-[24px] border hairline bg-card transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img src={p.cover} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                      {categoryLabel(p.category)}
                    </span>
                    <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                      {p.status === "published" ? "Published" : p.status === "archived" ? "Archived" : "Draft"}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-medium text-foreground">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {p.neighborhood}, {p.city} · {p.area ?? "—"}
                    </p>
                    <p className="mt-2 font-semibold text-emerald-700">{priceLabel(p)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to="/listings/$id/edit"
                        params={{ id: p.id }}
                        className="inline-flex items-center gap-1.5 rounded-full border hairline bg-background px-3.5 py-2 text-xs font-semibold text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      {p.status === "published" && (
                        <Link
                          to="/property/$id"
                          params={{ id: p.id }}
                          className="inline-flex items-center gap-1.5 rounded-full border hairline bg-background px-3.5 py-2 text-xs font-semibold text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${p.title}"? This cannot be undone.`)) remove.mutate(p.id);
                        }}
                        disabled={remove.isPending}
                        className="inline-flex items-center gap-1.5 rounded-full border hairline bg-background px-3.5 py-2 text-xs font-semibold text-red-600 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <EnquiriesInbox />
      </main>
      <SiteFooter />
    </>
  );
}
