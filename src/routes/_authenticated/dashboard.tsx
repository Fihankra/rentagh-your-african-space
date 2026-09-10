import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Home, Shield } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { getOnboardingState } from "@/lib/admin.functions";
import { claimFirstAdmin } from "@/lib/properties.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    // Parent `_authenticated` layout already verified the session; reuse it
    // instead of calling getUser() again.
    const user = context.user;
    if (user) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (isAdmin) throw redirect({ to: "/admin" });
    }
    return {};
  },
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard | RentaGh" },
      { name: "description", content: "Browse RentaGh and manage your account." },
      { property: "og:title", content: "Dashboard | RentaGh" },
      { property: "og:description", content: "Browse RentaGh and manage your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
});

function ClaimAdminBanner() {
  const qc = useQueryClient();
  const { data: state } = useQuery({
    queryKey: ["onboarding"],
    queryFn: () => getOnboardingState(),
  });

  const claim = useMutation({
    mutationFn: () => claimFirstAdmin({}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding"] }),
  });

  if (!state || state.adminExists) return null;

  return (
    <section className="mt-8 rounded-[24px] border hairline bg-card p-6">
      <Shield className="h-6 w-6 text-gold" />
      <h2 className="mt-3 font-display text-xl font-semibold text-foreground">
        Finish setting up RentaGh
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Nobody manages this site yet. Take the administrator spot to approve listings and add other
        administrators.
      </p>
      <button
        onClick={() => claim.mutate()}
        disabled={claim.isPending}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {claim.isPending ? "Setting up…" : "Become the administrator"}
      </button>
      {claim.isError && (
        <p className="mt-2 text-sm text-red-600">Could not complete that. Please try again.</p>
      )}
    </section>
  );
}

function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-x pt-28 pb-20 md:pt-32">
        <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
          Your dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse verified spaces, send enquiries and leave reviews.
        </p>

        <ClaimAdminBanner />

        <section className="mt-10 rounded-[24px] border hairline bg-card p-8">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Looking for a space?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Listings on RentaGh are published by the RentaGh team. Browse student hostels, houses
            for rent, building lands and farm lands, then message us straight from any property
            page.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Home className="h-4 w-4" />
              Browse all
            </Link>
            <Link
              to="/contact"
              className="rounded-full border hairline bg-background px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Contact us
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
