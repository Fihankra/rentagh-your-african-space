import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { adminListReviews, adminDeleteReview } from "@/lib/moderation.functions";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: AdminReviews,
  head: () => ({
    meta: [{ title: "Reviews | RentaGh Admin" }],
  }),
});

function AdminReviews() {
  const qc = useQueryClient();
  const { data: allReviews } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => adminListReviews(),
  });

  const removeReview = useMutation({
    mutationFn: (id: string) => adminDeleteReview({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Reviews</h1>
      <div className="mt-6 space-y-3">
        {!allReviews?.length ? (
          <p className="text-muted-foreground">No reviews have been left yet.</p>
        ) : (
          allReviews.map((r) => (
            <div key={r.id} className="rounded-[20px] border hairline bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <Star className="h-4 w-4 fill-[color:var(--accent)] text-[color:var(--accent)]" />
                    {r.rating} · {r.authorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.propertyTitle} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/property/$id"
                    params={{ id: r.propertyId }}
                    className="text-sm font-medium text-primary"
                  >
                    View listing
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Remove this review?")) removeReview.mutate(r.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
              {r.comment && <p className="mt-3 text-sm text-foreground/80">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
