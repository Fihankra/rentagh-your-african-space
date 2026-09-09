import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const nav: { to: string; params?: Record<string, string>; label: string }[] = [
  { to: "/browse/$category", params: { category: "homes" }, label: "Houses" },
  { to: "/browse/$category", params: { category: "hostels" }, label: "Hostels" },
  { to: "/browse/$category", params: { category: "lands" }, label: "Lands" },
  { to: "/browse/$category", params: { category: "farmlands" }, label: "Farm Lands" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact Us" },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overlay || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-background/85 backdrop-blur-md border-b hairline shadow-[0_1px_0_0_color-mix(in_oklab,var(--charcoal)_6%,transparent)]"
          : "bg-transparent"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2.5 rounded-full transition-colors",
            solid ? "" : "bg-white/95 px-2.5 py-1 shadow-[0_4px_18px_-8px_rgba(0,0,0,0.35)]"
          )}
        >
          <img src={logo} alt="RentaGh" className="h-8 w-auto md:h-10" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to as never}
              params={n.params as never}
              className={cn(
                "text-sm font-medium transition-colors",
                solid ? "text-foreground/75 hover:text-primary" : "text-white/85 hover:text-white"
              )}
              activeProps={{ className: solid ? "text-primary" : "text-white" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  solid ? "text-foreground/80 hover:bg-muted" : "text-white/90 hover:bg-white/10"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    solid ? "text-foreground/80 hover:bg-muted" : "text-white/90 hover:bg-white/10"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:-translate-y-0.5"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((s) => !s)}
          className={cn(
            "md:hidden rounded-full p-2 transition-colors",
            solid ? "text-foreground" : "text-white"
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t hairline bg-background">
          <div className="container-x flex flex-col gap-1 py-4">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to as never}
                params={n.params as never}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
