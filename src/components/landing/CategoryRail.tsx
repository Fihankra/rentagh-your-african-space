import { Link } from "@tanstack/react-router";
import { categories } from "@/lib/categories";

export function CategoryRail() {
  return (
    <section className="container-x -mt-14 relative z-10 hidden md:block">
      <div className="rounded-[28px] border hairline bg-card p-3 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-4 gap-1">
          {categories.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              to="/browse/$category"
              params={{ category: slug }}
              className="group flex flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center transition-colors hover:bg-muted"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--cream)] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[12px] font-semibold text-foreground/80">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MobileCategoryRail() {
  return (
    <section className="container-x mt-8 md:hidden">
      <div className="-mx-5 overflow-x-auto px-5 pb-1">
        <div className="flex gap-3">
          {categories.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              to="/browse/$category"
              params={{ category: slug }}
              className="flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl border hairline bg-card px-3 py-3 text-center"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-foreground/80">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}