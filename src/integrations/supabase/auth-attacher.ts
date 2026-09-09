import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data } = await supabase.auth.getSession();
  const headers = new Headers();
  const token = data.session?.access_token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return next({ headers });
});
