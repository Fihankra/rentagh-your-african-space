import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function SectionHeading({
  eyebrow, title, subtitle, link,
}: { eyebrow?: string; title: string; subtitle?: string; link?: { to: string; label: string; params?: Record<string, string> } }) {
  return (
    <div className="container-x flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 gold-rule" />
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl font-semibold text-foreground text-balance md:text-5xl">{title}</h2>
        {subtitle && <p className="mt-3 text-base text-muted-foreground md:text-lg">{subtitle}</p>}
      </div>
      {link && (
        <Link
          to={link.to as string}
          params={link.params as never}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
        >
          {link.label} <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}