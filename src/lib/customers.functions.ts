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

const customerSchema = z.object({
  fullName: z.string().min(2).max(200),
  phone: z.string().max(40).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  idNumber: z.string().max(80).optional(),
  customerType: z.enum(["tenant", "buyer"]),
  notes: z.string().max(2000).optional(),
});

/** Tenants (rent) and buyers (sale) — the people RentaGh signs deals with. */
export const adminListCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("customers")
      .select("id, full_name, phone, email, id_number, customer_type, notes, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((c: any) => ({
      id: c.id as string,
      fullName: c.full_name as string,
      phone: (c.phone as string | null) ?? undefined,
      email: (c.email as string | null) ?? undefined,
      idNumber: (c.id_number as string | null) ?? undefined,
      customerType: c.customer_type as "tenant" | "buyer",
      notes: (c.notes as string | null) ?? undefined,
      createdAt: c.created_at as string,
    }));
  });

export const adminCreateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => customerSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: row, error } = await context.supabase
      .from("customers")
      .insert({
        full_name: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        id_number: data.idNumber?.trim() || null,
        customer_type: data.customerType,
        notes: data.notes?.trim() || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminUpdateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => customerSchema.extend({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("customers")
      .update({
        full_name: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        id_number: data.idNumber?.trim() || null,
        customer_type: data.customerType,
        notes: data.notes?.trim() || null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("customers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** For dropdowns when creating a rent agreement (tenants) or sale (buyers). */
export const adminListCustomerOptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { customerType?: "tenant" | "buyer" }) => data)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    let query = context.supabase.from("customers").select("id, full_name, customer_type");
    if (data.customerType) query = query.eq("customer_type", data.customerType);
    const { data: rows, error } = await query.order("full_name");
    if (error) throw new Error(error.message);
    return (rows ?? []).map((c: any) => ({ id: c.id as string, fullName: c.full_name as string }));
  });
