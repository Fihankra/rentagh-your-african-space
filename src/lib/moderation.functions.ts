import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Every function here is admin-only; the check runs server-side on each call. */
async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

const idSchema = z.object({ id: z.string().uuid() });

/** Admin: every enquiry across all listings. */
export const adminListEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("enquiries")
      .select("id, name, email, phone, message, status, created_at, properties(title)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []).map((e: any) => ({
      id: e.id as string,
      name: e.name as string,
      email: e.email as string,
      phone: (e.phone as string | null) ?? undefined,
      message: e.message as string,
      status: e.status as string,
      createdAt: e.created_at as string,
      propertyTitle: (e.properties?.title as string) ?? "Listing",
    }));
  });

export const adminDeleteEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("enquiries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: every review across all listings. */
export const adminListReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("reviews")
      .select("id, rating, comment, author_name, created_at, property_id, properties(title)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      id: r.id as string,
      propertyId: r.property_id as string,
      propertyTitle: (r.properties?.title as string) ?? "Listing",
      rating: Number(r.rating ?? 0),
      comment: (r.comment as string | null) ?? "",
      authorName: (r.author_name as string | null) ?? "Guest",
      createdAt: r.created_at as string,
    }));
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: take a listing down for good. */
export const adminDeleteProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("properties").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
