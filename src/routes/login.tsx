import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — RentaGh" },
      { name: "description", content: "Sign in to RentaGh to manage your rentals, listings and enquiries." },
      { property: "og:title", content: "Login — RentaGh" },
      { property: "og:description", content: "Sign in to manage your rentals, listings and enquiries on RentaGh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setMessage("This email is already registered. Try signing in.");
        } else {
          setMessage("Check your email to confirm your account, then sign in.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container-x pt-32 pb-20">
        <div className="mx-auto w-full max-w-md rounded-[32px] border hairline bg-card p-8 shadow-[var(--shadow-card)]">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to manage your rentals, listings and enquiries."
              : "Join RentaGh to list your properties and manage rentals."}
          </p>

          <div className="mt-6 flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={mode === "signup"}
                  placeholder="Kwame Asare"
                  className="mt-2 w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "signin" && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/reset-password" className="font-semibold text-primary">
                Forgot password?
              </Link>
            </p>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to RentaGh?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
