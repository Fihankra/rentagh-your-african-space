import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — RentaGh" },
      { name: "description", content: "Sign in to RentaGh to manage your rentals, listings and enquiries." },
      { property: "og:title", content: "Login — RentaGh" },
      { property: "og:description", content: "Sign in to manage your rentals, listings and enquiries on RentaGh." },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});

function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-x pt-32 pb-20">
        <div className="mx-auto w-full max-w-md rounded-[32px] border hairline bg-card p-8 shadow-[var(--shadow-card)]">
          <h1 className="font-display text-3xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your rentals, listings and enquiries.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Accounts are not switched on yet — this is the sign-in screen your dashboards will use.
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            New to RentaGh?{" "}
            <Link to="/contact" className="font-semibold text-primary">
              Talk to our team
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
