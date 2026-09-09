import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, LayoutGrid, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { adminListUsers, adminSetUserRole, adminStats } from "@/lib/admin.functions";
import { adminListProperties, adminUpdatePropertyStatus, updateCategoryMetadata, claimFirstAdmin, listCategoryMetadata } from "@/lib/properties.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;
    if (error || !user) throw redirect({ to: "/login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/dashboard" });
    return {};
  },
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — RentaGh" },
      { name: "description", content: "Admin dashboard for RentaGh." },
      { property: "og:title", content: "Admin — RentaGh" },
      { property: "og:description", content: "Admin dashboard for RentaGh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
});

function AdminPage() {
  const [tab, setTab] = useState<"overview" | "categories" | "listings" | "users">("overview");
  const qc = useQueryClient();

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => adminStats() });
  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminListUsers(), enabled: tab === "users" });
  const { data: properties } = useQuery({ queryKey: ["admin-properties"], queryFn: () => adminListProperties(), enabled: tab === "listings" });
  const { data: categoryMeta } = useQuery({ queryKey: ["category-metadata"], queryFn: () => listCategoryMetadata() });

  const setRole = useMutation({
    mutationFn: adminSetUserRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const claimMutation = useMutation({
    mutationFn: claimFirstAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stats"] }),
  });

  const statusMutation = useMutation({
    mutationFn: adminUpdatePropertyStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const categoryMutation = useMutation({
    mutationFn: updateCategoryMetadata,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["category-metadata"] }),
  });

  return (
    <>
      <SiteHeader />
      <main className="container-x pt-28 pb-20 md:pt-32">
        <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">Admin dashboard</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {["overview", "categories", "listings", "users"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as typeof tab)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && stats && (
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<LayoutGrid className="h-5 w-5 text-primary" />} label="Listings" value={stats.properties} />
            <StatCard icon={<Users className="h-5 w-5 text-gold" />} label="Users" value={stats.users} />
            <StatCard icon={<Shield className="h-5 w-5 text-emerald-600" />} label="Admins" value={stats.admins} />
            <div className="rounded-[20px] border hairline bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">By category</p>
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
        )}

        {tab === "overview" && !stats && stats !== undefined && <p className="mt-10 text-muted-foreground">Unable to load stats.</p>}

        {tab === "categories" && categoryMeta && (
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            {categoryMeta
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((cat: any) => (
                <CategoryEditCard
                  key={cat.slug}
                  category={cat}
                  onSave={(data) => categoryMutation.mutate(data)}
                />
              ))}
          </section>
        )}

        {tab === "listings" && properties && (
          <section className="mt-10 space-y-4">
            {properties.map((p: any) => (
              <div key={p.id} className="flex flex-col gap-4 rounded-[20px] border hairline bg-card p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.cover} alt={p.title} className="h-16 w-16 rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-medium text-foreground">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {p.categoryLabel} · {p.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => statusMutation.mutate({ data: { id: p.id, status: p.status === "published" ? "draft" : "published", featured: p.featured } })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold",
                      p.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ data: { id: p.id, status: p.status, featured: !p.featured } })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold",
                      p.featured ? "bg-gold/20 text-amber-800" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {p.featured ? "Featured" : "Feature"}
                  </button>
                  <Link to="/property/$id" params={{ id: p.id }} className="text-sm font-medium text-primary">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "users" && users && (
          <section className="mt-10 overflow-hidden rounded-[20px] border hairline bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Roles</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t hairline">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.fullName || "—"}</td>
                    <td className="px-4 py-3">
                      {u.roles.length ? u.roles.join(", ") : "user"}
                    </td>
                    <td className="px-4 py-3">
                      {u.roles.includes("admin") ? (
                        <button
                          onClick={() => setRole.mutate({ data: { userId: u.id, role: "admin", active: false } })}
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800"
                        >
                          Remove admin
                        </button>
                      ) : (
                        <button
                          onClick={() => setRole.mutate({ data: { userId: u.id, role: "admin", active: true } })}
                          className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                        >
                          Make admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats?.admins === 0 && (
              <div className="flex items-start gap-3 border-t hairline p-4 text-sm text-amber-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p>No admins exist yet. You can claim the first admin role.</p>
                  <button
                    onClick={() => claimMutation.mutate({})}
                    disabled={claimMutation.isPending}
                    className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {claimMutation.isPending ? "Claiming…" : "Claim first admin"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-[20px] border hairline bg-card p-5">
      {icon}
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function CategoryEditCard({ category, onSave }: { category: any; onSave: (d: any) => void }) {
  const [label, setLabel] = useState(category.label);
  const [tagline, setTagline] = useState(category.tagline);

  return (
    <div className="rounded-[20px] border hairline bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{category.slug}</p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border hairline bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1 w-full rounded-xl border hairline bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
          />
        </div>
        <button
          onClick={() => onSave({ slug: category.slug, label, tagline, sort_order: category.sort_order })}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
