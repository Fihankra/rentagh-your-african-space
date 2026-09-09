import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { Property, Landmark } from "./property";
import type { CategorySlug } from "./categories";

function getPublicClient() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}


function numericOrNull(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function areaLabel(area_sqm: number | null | undefined, category: CategorySlug): string | undefined {
  if (area_sqm == null) return undefined;
  if (category === "lands" || category === "farmlands") {
    if (area_sqm >= 4046) return `${(area_sqm / 4046).toFixed(2)} acres`;
  }
  return `${Number(area_sqm).toLocaleString()} m²`;
}

async function fetchImages(supabase: any, ids: string[]) {
  const { data, error } = await supabase.from("property_images").select("*").in("property_id", ids);
  if (error) throw new Error(error.message);
  const by: Record<string, any[]> = {};
  for (const img of data ?? []) {
    if (!by[img.property_id]) by[img.property_id] = [];
    by[img.property_id].push(img);
  }
  return by;
}

/** Average rating + review count per published listing, keyed by property id. */
async function fetchRatings(supabase: any): Promise<Record<string, { avg: number; count: number }>> {
  const { data, error } = await supabase.rpc("property_rating_summary");
  if (error) return {};
  const by: Record<string, { avg: number; count: number }> = {};
  for (const r of data ?? []) {
    by[r.property_id] = { avg: Number(r.avg_rating ?? 0), count: Number(r.review_count ?? 0) };
  }
  return by;
}

function mapProperty(row: any, images: any[], landmarks: any[], reviews = 0, rating = 0): Property {
  const category = row.category as CategorySlug;
  const gallery = [row.cover_url, ...images.map((i) => i.url).filter((u) => u && u !== row.cover_url)].filter(Boolean);
  const fallbackGallery = [row.cover_url].filter(Boolean);
  return {
    id: row.id,
    title: row.title,
    category,
    city: row.city,
    region: row.region,
    neighborhood: row.neighborhood ?? "",
    priceGHS: Number(row.price),
    priceUnit: row.price_period ?? "total",
    beds: numericOrNull(row.beds),
    baths: numericOrNull(row.baths),
    area: areaLabel(row.area_sqm, category),
    verified: true,
    featured: row.featured ?? false,
    rating,
    reviews,
    cover: row.cover_url ?? "",
    gallery: gallery.length ? gallery : fallbackGallery,
    hostName: row.owner_display_name ?? "RentaGh Owner",
    hostRole: row.owner_role ?? "Owner",
    description: row.description ?? "",
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    coords: { lat: Number(row.lat ?? 5.6037), lng: Number(row.lng ?? -0.187) },
    landmarks: landmarks.map((l) => ({
      name: l.name,
      kind: l.kind,
      km: Number(l.km),
      mins: Number(l.mins),
    })),
    status: row.status ?? undefined,
    listingType: row.listing_type ?? undefined,
  };
}

const listFiltersSchema = z.object({
  category: z.enum(["all", "hostels", "homes", "lands", "farmlands"]).default("all"),
  region: z.string().default("All regions"),
  query: z.string().default(""),
  listingType: z.enum(["all", "rent", "sale"]).default("all"),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

export const listProperties = createServerFn({ method: "POST" })
  .inputValidator((data) => listFiltersSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getPublicClient();

    let q = supabase
      .from("properties")
      .select(`*, property_images(*), property_landmarks(*)`)
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (data.category !== "all") q = q.eq("category", data.category);
    if (data.region !== "All regions") q = q.eq("region", data.region);
    if (data.listingType !== "all") q = q.eq("listing_type", data.listingType);
    if (typeof data.minPrice === "number") q = q.gte("price", data.minPrice);
    if (typeof data.maxPrice === "number") q = q.lte("price", data.maxPrice);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const query = data.query.toLowerCase();
    const filtered = (rows ?? []).filter((p) => {
      if (!query) return true;
      const text = `${p.title} ${p.city} ${p.neighborhood ?? ""}`.toLowerCase();
      return text.includes(query);
    });

    const ratings = await fetchRatings(supabase);

    return filtered.map((p) =>
      mapProperty(
        p,
        p.property_images ?? [],
        p.property_landmarks ?? [],
        ratings[p.id]?.count ?? 0,
        ratings[p.id]?.avg ?? 0
      )
    );
  });

export const getPropertyById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("properties")
      .select(`*, property_images(*), property_landmarks(*)`)
      .eq("id", data.id)
      .eq("status", "published")
      .single();

    if (error || !row) return null;
    const ratings = await fetchRatings(supabase);
    return mapProperty(
      row,
      row.property_images ?? [],
      row.property_landmarks ?? [],
      ratings[row.id]?.count ?? 0,
      ratings[row.id]?.avg ?? 0
    );
  });

const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["hostels", "homes", "lands", "farmlands"]),
  listing_type: z.enum(["rent", "sale"]),
  price: z.number().positive(),
  price_period: z.enum(["night", "month", "year", "total"]).optional(),
  region: z.string().min(1),
  city: z.string().min(1),
  neighborhood: z.string().optional(),
  beds: z.number().int().optional(),
  baths: z.number().int().optional(),
  area_sqm: z.number().positive().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  cover_url: z.string().optional(),
  images: z.array(z.object({ url: z.string(), sort_order: z.number() })).default([]),
  landmarks: z.array(z.object({ name: z.string(), kind: z.string(), km: z.number(), mins: z.number() })).default([]),
});

export const createProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createPropertySchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only the administrator can add listings.");
    const status = data.status;
    const featured = data.featured;


    const { data: inserted, error } = await supabase
      .from("properties")
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        listing_type: data.listing_type,
        price: data.price,
        price_period: data.price_period ?? (data.listing_type === "sale" ? "total" : "month"),
        region: data.region,
        city: data.city,
        neighborhood: data.neighborhood,
        beds: data.beds,
        baths: data.baths,
        area_sqm: data.area_sqm,
        lat: data.lat,
        lng: data.lng,
        status,
        featured,
        amenities: data.amenities,
        cover_url: data.cover_url,
      })
      .select("id")
      .single();

    if (error || !inserted) throw new Error(error?.message ?? "Failed to create property");

    if (data.images.length) {
      await supabase.from("property_images").insert(
        data.images.map((img, i) => ({
          property_id: inserted.id,
          url: img.url,
          sort_order: img.sort_order ?? i,
        }))
      );
    }

    if (data.landmarks.length) {
      await supabase.from("property_landmarks").insert(
        data.landmarks.map((l) => ({
          property_id: inserted.id,
          name: l.name,
          kind: l.kind,
          km: l.km,
          mins: l.mins,
        }))
      );
    }

    return { id: inserted.id };
  });

const uploadImageSchema = z.instanceof(File);

export const uploadPropertyImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => uploadImageSchema.parse(data as File))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only the administrator can upload listing photos.");



    const file = data as File;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("property-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw new Error(error.message);

    // The bucket is private, so hand back a long-lived signed URL (10 years).
    const { data: urlData, error: signError } = await supabase.storage
      .from("property-images")
      .createSignedUrl(path, 60 * 60 * 24 * 3650);
    if (signError) throw new Error(signError.message);
    return { url: urlData.signedUrl };

  });

export const listCategoryMetadata = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("category_metadata")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const updateCategoryMetadata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string; label: string; tagline: string; sort_order: number }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { error } = await context.supabase
      .from("category_metadata")
      .update({ label: data.label, tagline: data.tagline, sort_order: data.sort_order })
      .eq("slug", data.slug as Database["public"]["Enums"]["property_category"]);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("properties")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (data ?? []).map((p: any) => p.id);
    const imagesById = ids.length ? await fetchImages(context.supabase, ids) : {};
    return (data ?? []).map((p: any) => mapProperty(p, imagesById[p.id] ?? [], []));
  });

export const adminListProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("properties")
      .select(`*, property_images(*), property_landmarks(*)`)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((p: any) =>
      mapProperty(
        p,
        p.property_images ?? [],
        p.property_landmarks ?? [],
        0,
        0
      )
    );
  });

export const adminUpdatePropertyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; featured: boolean }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { error } = await context.supabase
      .from("properties")
      .update({ status: data.status as any, featured: data.featured })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw new Error(error.message);
    return { ok: data === true };
  });

const updatePropertySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["hostels", "homes", "lands", "farmlands"]),
  listing_type: z.enum(["rent", "sale"]),
  price: z.number().positive(),
  price_period: z.enum(["night", "month", "year", "total"]).optional(),
  region: z.string().min(1),
  city: z.string().min(1),
  neighborhood: z.string().optional(),
  beds: z.number().int().optional(),
  baths: z.number().int().optional(),
  area_sqm: z.number().positive().optional(),
  status: z.enum(["draft", "published", "archived"]),
  amenities: z.array(z.string()).default([]),
  cover_url: z.string().optional(),
  images: z.array(z.object({ url: z.string(), sort_order: z.number() })).default([]),
});

/** Owner (or admin) fetch of a single listing, whatever its status. */
export const getMyProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("properties")
      .select(`*, property_images(*), property_landmarks(*)`)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return mapProperty(row, (row as any).property_images ?? [], (row as any).property_landmarks ?? []);
  });

export const updateMyProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updatePropertySchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only the administrator can edit listings.");


    const { data: existing, error: readError } = await supabase
      .from("properties")
      .select("id, user_id, status")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!existing) throw new Error("Listing not found");
    if (existing.user_id !== context.userId && !isAdmin) throw new Error("Forbidden");

    // Only admins may move a listing into the published state.
    const status = data.status === "published" && !isAdmin && existing.status !== "published" ? "draft" : data.status;

    const { error } = await supabase
      .from("properties")
      .update({
        title: data.title,
        description: data.description,
        category: data.category,
        listing_type: data.listing_type,
        price: data.price,
        price_period: data.price_period ?? (data.listing_type === "sale" ? "total" : "month"),
        region: data.region,
        city: data.city,
        neighborhood: data.neighborhood,
        beds: data.beds ?? null,
        baths: data.baths ?? null,
        area_sqm: data.area_sqm ?? null,
        status: status as any,
        amenities: data.amenities,
        cover_url: data.cover_url ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.images.length) {
      await supabase.from("property_images").delete().eq("property_id", data.id);
      await supabase.from("property_images").insert(
        data.images.map((img, i) => ({ property_id: data.id, url: img.url, sort_order: img.sort_order ?? i }))
      );
    }

    return { id: data.id, status };
  });

export const deleteMyProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only the administrator can delete listings.");
    const { error } = await context.supabase.from("properties").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
