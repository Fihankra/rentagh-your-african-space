import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Typographic wordmark. Replaces the old stacked icon+wordmark image, which
 * read awkwardly (too tall/vertical) inside a horizontal header. */
export function Logo({
  dark = false,
  floating = false,
  className,
}: {
  dark?: boolean;
  floating?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/"
      className={cn("font-display text-2xl font-semibold tracking-tight md:text-3xl", className)}
      style={floating ? { textShadow: "0 2px 10px rgba(0,0,0,0.45)" } : undefined}
    >
      <span className={dark ? "text-[color:var(--cream)]" : "text-primary"}>Renta</span>
      <span className="text-gold">Gh</span>
    </Link>
  );
}
