import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { adminUpdatePropertyStatus } from "@/lib/properties.functions";
import { adminDeleteProperty } from "@/lib/moderation.functions";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/property";
import { categoryLabel } from "@/lib/categories";

export function PropertiesTable({
  properties,
  emptyLabel,
}: {
  properties: Property[];
  emptyLabel: string;
}) {
  const qc = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: adminUpdatePropertyStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const removeProperty = useMutation({
    mutationFn: (id: string) => adminDeleteProperty({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  if (!properties.length) {
    return (
      <div className="rounded-[20px] border hairline bg-card p-10 text-center text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((p) => (
        <div
          key={p.id}
          className="flex flex-col gap-4 rounded-[20px] border hairline bg-card p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <img
              src={p.cover}
              alt={p.title}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
            <div>
              <h3 className="font-medium text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground">
                {categoryLabel(p.category)} · {p.neighborhood}, {p.city}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                statusMutation.mutate({
                  data: {
                    id: p.id,
                    status: p.status === "published" ? "draft" : "published",
                    featured: !!p.featured,
                  },
                })
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                p.status === "published"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800",
              )}
            >
              {p.status === "published" ? "Published" : "Draft"}
            </button>
            <button
              onClick={() =>
                statusMutation.mutate({
                  data: { id: p.id, status: p.status ?? "draft", featured: !p.featured },
                })
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                p.featured ? "bg-gold/20 text-amber-800" : "bg-muted text-muted-foreground",
              )}
            >
              {p.featured ? "Featured" : "Feature"}
            </button>
            <Link
              to="/listings/$id/edit"
              params={{ id: p.id }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            <Link
              to="/property/$id"
              params={{ id: p.id }}
              className="text-sm font-medium text-primary"
            >
              View
            </Link>
            <button
              onClick={() => {
                if (confirm(`Delete "${p.title}" permanently? This cannot be undone.`))
                  removeProperty.mutate(p.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
