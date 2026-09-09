import { createClient } from "@supabase/supabase-js";

const url =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_SUPABASE_URL ?? "")
    : (process.env.SUPABASE_URL ?? "");

const key =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "")
    : (process.env.SUPABASE_PUBLISHABLE_KEY ?? "");

if (!url || !key) {
  console.warn("[RentaGh] Supabase URL or publishable key is missing. Auth and database features are disabled until the project is connected to Supabase.");
}

export const supabase = createClient(url || "http://placeholder.invalid", key || "placeholder", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
