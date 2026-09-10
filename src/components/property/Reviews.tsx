import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { listReviews, saveMyReview, deleteMyReview } from "@/lib/reviews.functions";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Reviews({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: () => listReviews({ data: { propertyId } }),
  });

  const mine = user ? reviews.find((r) => r.userId === user.id) : undefined;

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment ?? "");
    }
  }, [mine?.id]);

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["reviews", propertyId] });
    qc.invalidateQueries({ queryKey: ["properties"] });
    qc.invalidateQueries({ queryKey: ["property", propertyId] });
  }

  const save = useMutation({
    mutationFn: () => saveMyReview({ data: { propertyId, rating, comment: comment || undefined } }),
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (e: any) => setError(e?.message ?? "Could not save your review."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMyReview({ data: { id } }),
    onSuccess: () => {
      setComment("");
      setRating(5);
      invalidate();
    },
  });

  const average = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <section className="mt-12 border-t hairline pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl text-foreground">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-foreground/75">
            <Star className="h-4 w-4 fill-[color:var(--accent)] text-[color:var(--accent)]" />
            <span className="font-semibold text-foreground">{average}</span>
            <span>
              · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {/* write / edit */}
      <div className="mt-6 rounded-3xl border hairline bg-card p-6">
        {!user ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>{" "}
            to share your experience with this property.
          </p>
        ) : (
          <>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {mine ? "Your review" : "Rate this property"}
            </div>
            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      n <= rating
                        ? "fill-[color:var(--accent)] text-[color:var(--accent)]"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="How was the place, the location and the owner?"
              className="mt-4 w-full resize-none rounded-2xl border hairline bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {save.isPending ? "Saving…" : mine ? "Update review" : "Post review"}
              </button>
              {mine && (
                <button
                  onClick={() => remove.mutate(mine.id)}
                  disabled={remove.isPending}
                  className="inline-flex items-center gap-2 rounded-2xl border hairline bg-background px-5 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* list */}
      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-3xl border hairline bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-foreground">{r.authorName}</div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn(
                        "h-3.5 w-3.5",
                        n <= r.rating
                          ? "fill-[color:var(--accent)] text-[color:var(--accent)]"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
              {r.comment && <p className="mt-3 text-sm text-foreground/80">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
