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

// --- Rent agreements ---------------------------------------------------

const rentAgreementSchema = z.object({
  propertyId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  rentAmount: z.number().positive(),
  pricePeriod: z.enum(["night", "month", "year", "total"]).default("month"),
  commissionRate: z.number().min(0).max(100).optional(),
  commissionAmount: z.number().min(0).optional(),
  depositAmount: z.number().min(0).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const adminListRentAgreements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("rent_agreements")
      .select(
        "id, property_id, owner_id, tenant_id, rent_amount, price_period, commission_rate, commission_amount, deposit_amount, start_date, end_date, status, notes, created_at, properties(title), property_owners(full_name), customers(full_name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      id: r.id as string,
      propertyId: r.property_id as string,
      propertyTitle: (r.properties?.title as string) ?? "Listing",
      ownerId: (r.owner_id as string | null) ?? undefined,
      ownerName: (r.property_owners?.full_name as string | null) ?? undefined,
      tenantId: r.tenant_id as string,
      tenantName: (r.customers?.full_name as string) ?? "Tenant",
      rentAmount: Number(r.rent_amount),
      pricePeriod: r.price_period as string,
      commissionRate: r.commission_rate != null ? Number(r.commission_rate) : undefined,
      commissionAmount: r.commission_amount != null ? Number(r.commission_amount) : undefined,
      depositAmount: r.deposit_amount != null ? Number(r.deposit_amount) : undefined,
      startDate: r.start_date as string,
      endDate: (r.end_date as string | null) ?? undefined,
      status: r.status as string,
      notes: (r.notes as string | null) ?? undefined,
      createdAt: r.created_at as string,
    }));
  });

export const adminCreateRentAgreement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => rentAgreementSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: row, error } = await context.supabase
      .from("rent_agreements")
      .insert({
        property_id: data.propertyId,
        owner_id: data.ownerId ?? null,
        tenant_id: data.tenantId,
        rent_amount: data.rentAmount,
        price_period: data.pricePeriod,
        commission_rate: data.commissionRate ?? null,
        commission_amount: data.commissionAmount ?? null,
        deposit_amount: data.depositAmount ?? null,
        start_date: data.startDate,
        end_date: data.endDate || null,
        notes: data.notes?.trim() || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminUpdateRentAgreementStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "active" | "ended" | "terminated" }) => data)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("rent_agreements")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- Rent payments (the commission ledger) ------------------------------

const rentPaymentSchema = z.object({
  rentAgreementId: z.string().uuid(),
  periodStart: z.string(),
  periodEnd: z.string(),
  amountDue: z.number().positive(),
  commissionAmount: z.number().min(0),
  payoutAmount: z.number().min(0),
});

export const adminListRentPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { rentAgreementId?: string }) => data)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    let query = context.supabase
      .from("rent_payments")
      .select(
        "id, rent_agreement_id, period_start, period_end, amount_due, commission_amount, payout_amount, status, collected_at, payout_at, rent_agreements(property_id, tenant_id, properties(title), customers(full_name))",
      )
      .order("period_start", { ascending: false });
    if (data.rentAgreementId) query = query.eq("rent_agreement_id", data.rentAgreementId);
    const { data: rows, error } = await query.limit(500);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((p: any) => ({
      id: p.id as string,
      rentAgreementId: p.rent_agreement_id as string,
      propertyTitle: (p.rent_agreements?.properties?.title as string) ?? "Listing",
      tenantName: (p.rent_agreements?.customers?.full_name as string) ?? "Tenant",
      periodStart: p.period_start as string,
      periodEnd: p.period_end as string,
      amountDue: Number(p.amount_due),
      commissionAmount: Number(p.commission_amount),
      payoutAmount: Number(p.payout_amount),
      status: p.status as string,
      collectedAt: (p.collected_at as string | null) ?? undefined,
      payoutAt: (p.payout_at as string | null) ?? undefined,
    }));
  });

export const adminCreateRentPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => rentPaymentSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: row, error } = await context.supabase
      .from("rent_payments")
      .insert({
        rent_agreement_id: data.rentAgreementId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        amount_due: data.amountDue,
        commission_amount: data.commissionAmount,
        payout_amount: data.payoutAmount,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminUpdateRentPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { id: string; status: "pending" | "collected" | "paid_to_landlord" | "overdue" }) =>
      data,
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const now = new Date().toISOString();
    const patch = {
      status: data.status,
      ...(data.status === "collected" ? { collected_at: now } : {}),
      ...(data.status === "paid_to_landlord" ? { payout_at: now } : {}),
    };
    const { error } = await context.supabase.from("rent_payments").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- Sale transactions (RentaGh buys, holds, resells) --------------------

const saleCreateSchema = z.object({
  propertyId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  acquisitionCost: z.number().positive(),
  acquisitionDate: z.string(),
  notes: z.string().max(2000).optional(),
});

const saleUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["held", "listed", "sold"]),
  buyerId: z.string().uuid().optional(),
  salePrice: z.number().positive().optional(),
  saleDate: z.string().optional(),
});

export const adminListSaleTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("sale_transactions")
      .select(
        "id, property_id, owner_id, buyer_id, acquisition_cost, acquisition_date, sale_price, sale_date, status, notes, created_at, properties(title), property_owners(full_name), customers(full_name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((s: any) => ({
      id: s.id as string,
      propertyId: s.property_id as string,
      propertyTitle: (s.properties?.title as string) ?? "Listing",
      ownerId: (s.owner_id as string | null) ?? undefined,
      ownerName: (s.property_owners?.full_name as string | null) ?? undefined,
      buyerId: (s.buyer_id as string | null) ?? undefined,
      buyerName: (s.customers?.full_name as string | null) ?? undefined,
      acquisitionCost: Number(s.acquisition_cost),
      acquisitionDate: s.acquisition_date as string,
      salePrice: s.sale_price != null ? Number(s.sale_price) : undefined,
      saleDate: (s.sale_date as string | null) ?? undefined,
      status: s.status as string,
      notes: (s.notes as string | null) ?? undefined,
      profit: s.sale_price != null ? Number(s.sale_price) - Number(s.acquisition_cost) : undefined,
      createdAt: s.created_at as string,
    }));
  });

export const adminCreateSaleTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => saleCreateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: row, error } = await context.supabase
      .from("sale_transactions")
      .insert({
        property_id: data.propertyId,
        owner_id: data.ownerId ?? null,
        acquisition_cost: data.acquisitionCost,
        acquisition_date: data.acquisitionDate,
        notes: data.notes?.trim() || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminUpdateSaleTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => saleUpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("sale_transactions")
      .update({
        status: data.status,
        buyer_id: data.buyerId ?? null,
        sale_price: data.salePrice ?? null,
        sale_date: data.saleDate || null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSaleTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("sale_transactions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- Commissions (combined revenue ledger) --------------------------------

export const adminCommissionsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);

    const [{ data: payments, error: paymentsError }, { data: sales, error: salesError }] =
      await Promise.all([
        context.supabase
          .from("rent_payments")
          .select(
            "id, commission_amount, status, collected_at, rent_agreements(properties(title), customers(full_name))",
          )
          .in("status", ["collected", "paid_to_landlord"])
          .order("collected_at", { ascending: false }),
        context.supabase
          .from("sale_transactions")
          .select("id, sale_price, acquisition_cost, sale_date, properties(title)")
          .eq("status", "sold")
          .order("sale_date", { ascending: false }),
      ]);
    if (paymentsError) throw new Error(paymentsError.message);
    if (salesError) throw new Error(salesError.message);

    const rentEntries = (payments ?? []).map((p: any) => ({
      id: p.id as string,
      type: "rent" as const,
      label: (p.rent_agreements?.properties?.title as string) ?? "Rent commission",
      subLabel: (p.rent_agreements?.customers?.full_name as string) ?? undefined,
      amount: Number(p.commission_amount),
      date: (p.collected_at as string | null) ?? undefined,
    }));
    const saleEntries = (sales ?? []).map((s: any) => ({
      id: s.id as string,
      type: "sale" as const,
      label: (s.properties?.title as string) ?? "Sale profit",
      subLabel: undefined,
      amount: Number(s.sale_price) - Number(s.acquisition_cost),
      date: (s.sale_date as string | null) ?? undefined,
    }));

    const entries = [...rentEntries, ...saleEntries].sort((a, b) =>
      (b.date ?? "").localeCompare(a.date ?? ""),
    );

    const rentTotal = rentEntries.reduce((sum, e) => sum + e.amount, 0);
    const saleTotal = saleEntries.reduce((sum, e) => sum + e.amount, 0);

    return {
      rentCommissionTotal: rentTotal,
      saleProfitTotal: saleTotal,
      total: rentTotal + saleTotal,
      entries,
    };
  });
