import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function getPublicClient() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type PublicReview = {
  id: string;
  rating: number;
  comment?: string;
  authorName: string;
  createdAt: string;
  userId: string;
};

/** Public: reviews for a published listing. */
export const listReviews = createServerFn({ method: "GET" })
  .inputValidator((data: { propertyId: string }) => data)
  .handler(async ({ data }): Promise<PublicReview[]> => {
    const supabase = getPublicClient();
    const { data: rows, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, author_name, created_at, user_id")
      .eq("property_id", data.propertyId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      id: r.id as string,
      rating: Number(r.rating),
      comment: (r.comment as string | null) ?? undefined,
      authorName: (r.author_name as string | null) ?? "RentaGh guest",
      createdAt: r.created_at as string,
      userId: r.user_id as string,
    }));
  });

const reviewSchema = z.object({
  propertyId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1500).optional(),
});

/** Signed-in: leave or update your own review on a published listing. */
export const saveMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => reviewSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();

    const { error } = await supabase.from("reviews").upsert(
      {
        property_id: data.propertyId,
        user_id: userId,
        rating: data.rating,
        comment: data.comment?.trim() || null,
        author_name: (profile?.full_name as string | null) ?? null,
      },
      { onConflict: "property_id,user_id" }
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Signed-in: remove your own review (admins may remove any). */
export const deleteMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
