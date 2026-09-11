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

const ownerSchema = z.object({
  fullName: z.string().min(2).max(200),
  phone: z.string().max(40).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  idNumber: z.string().max(80).optional(),
  address: z.string().max(300).optional(),
  notes: z.string().max(2000).optional(),
});

/** Landlords (rent) and sellers (sale) — the people RentaGh sources properties from. */
export const adminListOwners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("property_owners")
      .select("id, full_name, phone, email, id_number, address, notes, created_at, properties(id)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((o: any) => ({
      id: o.id as string,
      fullName: o.full_name as string,
      phone: (o.phone as string | null) ?? undefined,
      email: (o.email as string | null) ?? undefined,
      idNumber: (o.id_number as string | null) ?? undefined,
      address: (o.address as string | null) ?? undefined,
      notes: (o.notes as string | null) ?? undefined,
      createdAt: o.created_at as string,
      propertyCount: (o.properties ?? []).length as number,
    }));
  });

export const adminCreateOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ownerSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: row, error } = await context.supabase
      .from("property_owners")
      .insert({
        full_name: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        id_number: data.idNumber?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminUpdateOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ownerSchema.extend({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("property_owners")
      .update({
        full_name: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        id_number: data.idNumber?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("property_owners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** For dropdowns when linking a property to its owner, or picking an owner on a deal. */
export const adminListOwnerOptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("property_owners")
      .select("id, full_name")
      .order("full_name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((o: any) => ({ id: o.id as string, fullName: o.full_name as string }));
  });
