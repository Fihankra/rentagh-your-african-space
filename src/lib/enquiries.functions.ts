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

const enquirySchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  message: z.string().min(10).max(2000),
});

/** Public: send an enquiry about a published listing. */
export const sendEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data) => enquirySchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getPublicClient();

    // Only published listings can receive enquiries; owner is resolved server-side.
    const { data: property, error: readError } = await supabase
      .from("properties")
      .select("id, user_id, status")
      .eq("id", data.propertyId)
      .eq("status", "published")
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!property) throw new Error("This listing is no longer available.");

    const { error } = await supabase.from("enquiries").insert({
      property_id: property.id,
      owner_id: property.user_id,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      message: data.message.trim(),
    });
    if (error) throw new Error(error.message);

    return { ok: true };
  });

/** Owner inbox. */
export const listMyEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("enquiries")
      .select(
        "id, property_id, name, email, phone, message, status, created_at, properties(title), enquiry_replies(id, body, created_at)"
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((e: any) => ({
      id: e.id as string,
      propertyId: e.property_id as string,
      propertyTitle: (e.properties?.title as string) ?? "Listing",
      name: e.name as string,
      email: e.email as string,
      phone: (e.phone as string | null) ?? undefined,
      message: e.message as string,
      status: e.status as string,
      createdAt: e.created_at as string,
      replies: ((e.enquiry_replies ?? []) as any[])
        .map((r) => ({ id: r.id as string, body: r.body as string, createdAt: r.created_at as string }))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }));
  });

/** Owner: reply inside an enquiry thread. Marks the enquiry as replied. */
export const replyToEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), body: z.string().min(2).max(2000) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("enquiry_replies")
      .insert({ enquiry_id: data.id, owner_id: userId, body: data.body.trim() });
    if (error) throw new Error(error.message);
    await supabase.from("enquiries").update({ status: "replied" }).eq("id", data.id);
    return { ok: true };
  });

export const updateEnquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "new" | "read" | "replied" }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("enquiries")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
