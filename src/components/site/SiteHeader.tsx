import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, Shield, ChevronDown } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/site/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav: { to: string; params?: Record<string, string>; label: string }[] = [
  { to: "/browse/$category", params: { category: "homes" }, label: "Houses" },
  { to: "/browse/$category", params: { category: "hostels" }, label: "Hostels" },
  { to: "/browse/$category", params: { category: "lands" }, label: "Lands" },
  { to: "/browse/$category", params: { category: "farmlands" }, label: "Farm Lands" },
];

/** Frosted, light-opacity pill used to keep header content legible when it's
 * floating over the hero photo instead of a solid bar. */
const pill = "rounded-full bg-white/70 backdrop-blur-md shadow-[0_4px_18px_-8px_rgba(0,0,0,0.25)]";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const solid = !overlay || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-background/85 backdrop-blur-md border-b hairline shadow-[0_1px_0_0_color-mix(in_oklab,var(--charcoal)_6%,transparent)]"
          : "bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-3 md:h-20">
        <div className={cn(!solid && cn(pill, "px-3 py-1.5"))}>
          <Logo />
        </div>

        <nav className={cn("hidden items-center gap-6 md:flex", !solid && cn(pill, "px-6 py-2.5"))}>
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to as never}
              params={n.params as never}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className={cn("hidden items-center gap-3 md:flex", !solid && cn(pill, "px-2 py-1.5"))}>
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell solid />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
                    <User className="h-4 w-4" />
                    {isAdmin ? "Admin" : "Account"}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.email && (
                    <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  )}
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="h-4 w-4" />
                        Admin dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            "rounded-full p-2 text-foreground transition-colors md:hidden",
            !solid && pill,
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
                <div className="flex items-center justify-between rounded-lg px-3 py-2">
                  <span className="truncate text-sm text-muted-foreground">{user.email}</span>
                  <NotificationBell solid />
                </div>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
                  >
                    Admin dashboard
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-muted"
                  >
                    Dashboard
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
