import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Typographic wordmark — replaces the old stacked icon+wordmark image, which
 * read awkwardly (too tall/vertical) inside a horizontal header. */
export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      className={cn("font-display text-2xl font-semibold tracking-tight md:text-3xl", className)}
    >
      <span className={dark ? "text-[color:var(--cream)]" : "text-primary"}>Renta</span>
      <span className="text-gold">Gh</span>
    </Link>
  );
}
