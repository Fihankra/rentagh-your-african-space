import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listCategoryMetadata, updateCategoryMetadata } from "@/lib/properties.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
  head: () => ({
    meta: [{ title: "Site Settings — RentaGh Admin" }],
  }),
});

function CategoryEditCard({ category, onSave }: { category: any; onSave: (d: any) => void }) {
  const [label, setLabel] = useState(category.label);
  const [tagline, setTagline] = useState(category.tagline);

  return (
    <div className="rounded-[20px] border hairline bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {category.slug}
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border hairline bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1 w-full rounded-xl border hairline bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
          />
        </div>
        <button
          onClick={() =>
            onSave({ slug: category.slug, label, tagline, sort_order: category.sort_order })
          }
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

function AdminSettings() {
  const qc = useQueryClient();
  const { data: categoryMeta } = useQuery({
    queryKey: ["category-metadata"],
    queryFn: () => listCategoryMetadata(),
  });

  const categoryMutation = useMutation({
    mutationFn: updateCategoryMetadata,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["category-metadata"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
        Site Settings
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Category labels and taglines shown across the site. The four categories themselves are
        fixed.
      </p>
      {categoryMeta && (
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {categoryMeta
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((cat: any) => (
              <CategoryEditCard
                key={cat.slug}
                category={cat}
                onSave={(data) => categoryMutation.mutate(data)}
              />
            ))}
        </section>
      )}
    </div>
  );
}
