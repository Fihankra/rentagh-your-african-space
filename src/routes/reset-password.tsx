import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset Password | RentaGh" },
      { name: "description", content: "Reset your RentaGh account password." },
      { property: "og:title", content: "Reset Password | RentaGh" },
      { property: "og:description", content: "Reset your RentaGh account password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/reset-password" }],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phase, setPhase] = useState<"request" | "update" | "done">("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    if (params.get("type") === "recovery" && params.get("access_token")) {
      setPhase("update");
    }
  }, []);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("If that email exists, you will receive a reset link.");
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setPhase("done");
      setTimeout(() => navigate({ to: "/login", replace: true }), 1500);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container-x pt-32 pb-20">
        <div className="mx-auto w-full max-w-md rounded-[32px] border hairline bg-card p-8 shadow-[var(--shadow-card)]">
          {phase === "request" && (
            <>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                Reset password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we will send a reset link.
              </p>
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
              <form onSubmit={requestReset} className="mt-6 space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}

          {phase === "update" && (
            <>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                Choose new password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter a new password for your account.
              </p>
              {error && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}
              <form onSubmit={updatePassword} className="mt-6 space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="New password"
                  className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirm password"
                  className="w-full rounded-2xl border hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Update password"}
                </button>
              </form>
            </>
          )}

          {phase === "done" && (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              Password updated. Redirecting to sign in…
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
